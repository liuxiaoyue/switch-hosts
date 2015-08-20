/**
 * @fileoverview 静态服务器配置文件
 *
 * @create 2014-01-13
 * @author xiaoyue3
 */
define('conf/main', function(require, exports, module) {
	var $ = require('$');
	var store = require('mods/store');
	require('jquery-ui');
	require('bootstrap');
	require('select');
	require('switch');
	require('checkbox');
	var _ = require('lib/lodash');
	_.templateSettings = {
		evaluate: /\{%([\s\S]+?)%\}/g,
		interpolate: /\{%=([\s\S]+?)%\}/g
	};

	function addLine(table, lineTpl) {
		var newtr = table.find('[data-node=newtr]');
		if (newtr.length) {
			newtr.find('input:eq(0)').focus();
			lightline(newtr);
			return;
		}
		var tr = $(lineTpl);
		table.find('tbody').append(tr);
		tr.find('input:eq(0)').focus();
	}

	function lightline(el, color) {
		color = color || '#ccc';
		el.css({
			'background-color': color,
			'transition': 'background-color 0.5s ease-in'
		});
		setTimeout(function() {
			el.css({
				'background-color': '',
				'transition': 'background-color 0.5s ease-out'
			});
		},
		500);

	}

	//统一收集数据，给动画延迟，加锁
	function fetch(configs) {
		var cb = configs.success || function() {};
		if (!fetch.lock) {
			fetch.lock = true;
			configs.success = function() {
				var args = Array.prototype.slice.call(arguments, 0);
				fetch.lock = false;
				cb.apply(this, args);
			};
			configs.dataType = configs.dataType || 'json';
			setTimeout(function() {
				$.ajax(configs);
			},
			250);
		}
	}

	var backbone = require('lib/backbone');

	var scope = backbone.Model.extend({
		setData: function(key, filter) {
			var self = this;
			this.fetch({
				success: function() {
					var data = filter(self.get(key));
					if (data) {
						self.save(key, data, {
							success: function() {
								self.trigger('change:' + key);
							}
						});
					}
				}
			});
		},
		initialize: function() {
			this.fetch();
		},
		url: '/scope'
	});

	var commonView = {
		cancel: function(e) {
			$(e.target).closest('tr').remove();
		},
		editinput: function(e) {
			var target = $(e.target);
			var input = $('<input type="text" class="form-control">').val(target.text().trim());
			target.html(input);
			input.focus();
		}
	};

	var $scope = new scope();

	var hosts = backbone.View.extend({
		model: $scope,
		events: {
			'click [data-action=clearHostCache]': 'clearHostCache',
			'click [data-action=addHostGroup]': 'addHostGroup',
			'click [data-action=editHostGroup]': 'editHostGroup',
			'click [data-action=editinput]': 'editinput',
			'blur [data-action=editinput]': 'blurinput',
			'click [data-action=activeHost]': 'activeHost',
			'click [data-action=addHost]': 'addHost',
			'click [data-action=removeHostGroup]': 'removeHostGroup',
			'click [data-action=editHost]': 'editHost',
			'click [data-action=removeHost]': 'removeHost',
			'change [data-action=checkHost]': 'disableHost',
			'click [data-action=savenew]': 'savenew',
			'click [data-action=cancel]': 'cancel',
			'click [data-action=toggleHost]': 'toggleHost',
			'click [data-action=activeHostGroup]': 'activeHostGroup',
			'click [data-action=disableHostGroup]': 'disableHostGroup'
		},
		editinput: commonView.editinput,
		cancel: commonView.cancel,
		clearHostCache : function(e){
			var target = $(e.target);
			target.select();
		},
		toggleHost:function(e){
			var self = this;	
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			var key = '_fd_hosts_'+groupname;
			var status = e._type == 1 ? 1 : store.get(key);
			if(status == 1){
				target.closest('table').find('tbody').show();
				target.text('hide');
				store.set(key,0);	
			}else{
				target.closest('table').find('tbody').hide();
				target.text('show');
				store.set(key,1);	
			}
		},
		blurinput: function(e) {
			var model = this.model;
			var target = $(e.target);
			var parent = target.parent();
			var srcval, toval;
			var domain = parent.attr('data-domain');
			var val = target.val();
			var ip = parent.attr('data-ip');
			var groupname = parent.attr('data-groupname');
			var disabled = parent.attr('data-disabled');
			var nodeType = parent.attr('data-node');
			if (nodeType == 'domain') {
				srcval = val;
				toval = ip;
				if (val == domain || val === '') {
					parent.html(domain);
					return;
				}
			} else if (nodeType == 'ip') {
				srcval = domain;
				toval = val;
				if (val == ip || val === '') {
					parent.html(ip);
					return;
				}
			}
			var data = {
				'domain': srcval,
				'ip': toval,
				'disabled': disabled,
				'groupname': groupname,
				'olddomain': domain,
				'oldip': ip
			};
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'editrule',
					data: data
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		activeHostGroup: function(e) {
			var model = this.model;
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'activeGroup',
					data: {
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		disableHostGroup: function(e) {
			var model = this.model;
			var target = $(e.target);
			var groupname = target.attr('data-groupname');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'disableGroup',
					data: {
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		disableHost: function(e) {
			var model = this.model;
			var target = $(e.target).closest('.switch').find('input[data-node=checkHost]');
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			var disabled = target.attr('checked') ? true: false;
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: disabled ? 'disablerule': 'activerule',
					data: {
						domain: domain,
						ip: ip,
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		addHostGroup: function(e) {
			var model = this.model;
			var groupname = prompt('请输入Hosts组名');
			if (groupname) {
				model.fetch({
					success: function() {
						fetch({
							url: '/hostFile',
							type: 'post',
							data: {
								type: 'addGroup',
								data: {
									groupname: groupname
								}
							},
							success: function(data) {
								model.set(data);
							}
						});
					}
				});
			}
		},
		editHostGroup: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var newname = prompt('编辑HOST组名', groupname);
			if (newname) {
				fetch({
					url: 'hostFile',
					data: {
						type: 'en',
						data: {
							oldname: groupname,
							newname: newname
						}
					},
					type: 'post',
					success: function(data) {
						model.set(data);
					}
				});
			}

		},
		activeHost: function(e) {
			$('[data-action=activeHost]').addClass('btn-success');
			var wrap = $(e.target).parent();
			$('.panel_group').hide();
			wrap.find('.panel_group').show();
			$(e.target).removeClass('btn-success');
		},
		addHost: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			var tr = '<tr data-node="newtr">\
					<td><input data-node="domain" type="text" class="form-control"></td>\
					<td><input data-node="ip" type="text" class="form-control"></td>\
					<td></td>\
					<td>\
						<button data-action="savenew" class="btn btn-primary">Save</button>\
						<button data-action="cancel" class="btn btn-default">Cancel</button>\
					</td>\
				</tr>';
            $("html,body").animate({scrollTop:$('#hosts_table_' + groupname).offset().top},500);
            this.toggleHost({target: "#hosts_table_"+groupname+" [data-action=toggleHost]", _type: 1});
			addLine($('#hosts_table_' + groupname), tr);
		},
		savenew: function(e) {
			var model = this.model;
			var target = $(e.target);
			var tr = target.closest('tr');
			var groupname = target.closest('table').attr('data-groupname');
			var srcval = tr.find('[data-node=domain]').val().trim();
			var toval = tr.find('[data-node=ip]').val().trim();
			if(srcval === '' || toval ===''){
				tr.find('input[type=text]').each(function(index, el) {
					lightline($(el), '#f5d313');
				});
				return;	
			}
			var data = {
				'domain': srcval,
				'ip': toval,
				'disabled': false,
				'groupname': groupname
			};
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'editrule',
					data: data
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		removeHostGroup: function(e) {
			var model = this.model;
			var groupname = $(e.target).attr('data-value');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'removeGroup',
					data: {
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		removeHost: function(e) {
			var model = this.model;
			var target = $(e.target).closest('button');
			var domain = target.attr('data-domain');
			var ip = target.attr('data-ip');
			var groupname = target.attr('data-groupname');
			fetch({
				url: '/hostFile',
				type: 'post',
				data: {
					type: 'deleterule',
					data: {
						domain: domain,
						ip: ip,
						groupname: groupname
					}
				},
				success: function(data) {
					model.set(data);
				}
			});
		},
		el: '#hosts',
		template: $('#hosts_template').html(),
		render: function() {
			this.$el.html(_.template(this.template, this.model.attributes));
			this.$el.find('[data-node=checkHost]').wrap('<div class="switch " data-action="checkHost">').parent().bootstrapSwitch();
		},
		initToggle:function(hosts){
			var self = this;		   
			for(var i in hosts){
				if(hosts.hasOwnProperty(i)){
					var key = '_fd_hosts_'+i;
					var status = store.get(key);
					if(status === undefined) store.set(key,1);
					var txt = (status == 1) ? 'show' : 'hide';
					var fun = (status == 1) ? 'hide' : 'show';
					var btn = self.$el.find('button[data-action=toggleHost][data-groupname='+i+']');
					btn.text(txt);
					btn.closest('table').find('tbody')[fun]();
				}	
			}
		},
		initialize: function() {
			var self = this;
			this.model.on('change:hosts', function() {
				self.render();
				self.initToggle(self.model.get('hosts'));
			});
		}
	});
    
	var hostsView = new hosts();

	var workspace = backbone.Router.extend({
		routes: {
			'': "hosts",
			'hosts': "hosts"
		},
		hosts: function() {
			$('.J_content').hide();
			hostsView.$el.closest('.J_content').show();
		},
		initialize: function() {
			backbone.history.start();
		}
	});

	var myRouter = new workspace();
});
