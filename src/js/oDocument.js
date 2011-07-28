/**
 * oDocument
 * version: 0.0.2 beta
 * author: nino zhang
 * email: ninozhang@foxmail.com
 * last update: 2011/7/28
 * https://github.com/ninozhang/oDocument
 */
 
(function ($) {
var win = window,
	doc = window.document,
	
	version = '0.0.2 beta',
	homepage = 'https://github.com/ninozhang/oDocument',
	
	navi = null,
	sidebar = null,
	description = null,
	module = null,
	api = null,
	foot = null,
	
	naviHash = null,
	moduleHash = null,
	detailHash = null;

var Router = Backbone.Router.extend({
	routes: {
		':navi': 'navi',
		':navi/:module': 'module',
		'api/:module/:api': 'api'
	},
	navi: function(n) {
		naviHash = n;
		if(navi) {
			navi.render();
		}
		if(sidebar) {
			sidebar.render();
		}
		if(description) {
			description.render();
		}
	},
	module: function(n, m) {
		naviHash = n;
		moduleHash = m;
		if(navi) {
			navi.render();
		}
		if(sidebar) {
			sidebar.render();
		}
		if(module) {
			module.render();
		}
	},
	api: function(m, d) {
		naviHash = 'api';
		moduleHash = m;
		detailHash = d;
		if(navi) {
			navi.render();
		}
		if(sidebar) {
			sidebar.render();
		}
		if(api) {
			api.render();
		}
	}
});

var Navi = Backbone.View.extend({
	render: function() {
		var doc = this.model.get('doc'),
			router = this.model.get('router'),
			parent = $('.navi').empty(),
			ul = $('<ul>');
		for(var name in doc) {
			var module = doc[name],
				label = module.label,
				li = $('<li>').appendTo(ul),
				a = $('<a>').appendTo(li);
			a.attr('href', '#' + name)
			 .html(label)
			 .click(function(event) {
				$('.navi').find('ul').children().removeClass('c');
				$(event.target).parent().addClass('c');
			 });
			li.attr('name', name);
			if(name == naviHash) {
				li.addClass('c');
			}
		}
		if(ul.find('.c').size() == 0) {
			var first = ul.children().first();
			first.addClass('c');
			router.navigate(first.attr('name'), true);
		}
		parent.append(ul);
	}
});

var SideBar = Backbone.View.extend({
	render: function() {
		var doc = this.model.get('doc'),
			router = this.model.get('router'),
			parent = $('.sidebar').empty(),
			title = $('<h1>'),
			ul = $('<ul>'),
			clear = $('<div>').addClass('clear'),
			content = null;
		for(var name in doc) {
			if(naviHash != name) {
				continue;
			}
			var module = doc[name];
			content = module.content;
			title.attr('name', naviHash)
				 .html(module.label)
				 .click(function(event) {
				 	router.navigate(naviHash, true);
				 });
			break;
		}
		if(content) {
			for(var name in content) {
				var module = content[name],
					label = module.label,
					li = $('<li>').appendTo(ul);
				li.attr('name', name)
				  .html(label)
				  .click(function(event) {
					var target = $(event.target);
					$('.sidebar').find('ul').children().removeClass('c');
						  	target.addClass('c');
					router.navigate(naviHash + '/' + target.attr('name'), true);
				  });
				if(name == moduleHash) {
					li.addClass('c');
				}
			}
		}
		parent.append(title)
			  .append(ul)
			  .append(clear);
	}
});

var Description = Backbone.View.extend({
	render: function() {
		var doc = this.model.get('doc'),
			main = $('.main').empty(),
			subject = $('<div>'),
			container = $('<div>'),
			content = null;
		for(var name in doc) {
			if(name != naviHash) {
				continue;
			}
			var module = doc[name],
				label = module.label;
			subject.addClass('subject')
				   .html(label);
			content = module.content;
			break;
		}
		for(var name in content) {
			var module = content[name],
				label = module.label,
				text = module.text,
				line = $('<div>').appendTo(container),
				a = $('<a>').appendTo(line),
				span = $('<span>').appendTo(line);
			a.attr('href', '#' + naviHash + '/' + name)
			 .html(label);
			span.html(' - ' + text);
			line.addClass('description');
		}
		container.addClass('content');
		main.append(subject)
			.append(container);
	}
});

var Module = Backbone.View.extend({
	render: function() {
		var doc = this.model.get('doc'),
			router = this.model.get('router'),
			apiStyle = (naviHash == 'api'),
			main = $('.main').empty(),
			content = null;
		for(var name in doc) {
			if(name != naviHash) {
				continue;
			}
			var module = doc[name];
			for(var subName in module.content) {
				if(subName != moduleHash) {
					continue;
				}
				var subModule = module.content[subName],
					label = subModule.label;
				content = subModule.content;
				$('<div>').addClass('subject')
						  .html(label)
						  .appendTo(main);
				break;
			}
			break;
		}
		for(var name in content) {
			var part = content[name],
				label = part.label ? part.label : name,
				text = part.text;
			if(label) {
				var bar = $('<div>').addClass('bar')
						  			.html(label)
						  			.appendTo(main);
				if(apiStyle) {
					bar.addClass('pointer')
					   .attr('name', naviHash + '/' + moduleHash + '/' + name)
					   .html(moduleHash + '/' + name)
					   .click({router: router}, function(event) {
					   	var router = event.data.router,
					   		hash = $(event.target).attr('name');
					   	router.navigate(hash, true);
					   });
				}
			}
			if(text) {
				$('<div>').addClass('content')
						  .html(text)
						  .appendTo(main);
			}
		}
	}
});

var API = Backbone.View.extend({
	render: function() {
		var doc = this.model.get('doc'),
			root = doc.api.root ? doc.api.root : '',
			api = doc.api.content[moduleHash].content[detailHash],
			url = moduleHash + '/' + detailHash,
			label = api.label,
			updateTime = api.updateTime,
			text = api.text,
			request = api.request,
			method = (request && request.method) ? request.method : 'get',
			parameters = request ? request.parameters : null,
			parameterCount = parameters ? parameters.length : 0,
			requestSample = request ? request.sample : null,
			response = api.response,
			responseSample = response ? response.sample : null,
			highlight = false,
			main = $('.main').empty();
		// 标题
		$('<div>').addClass('subject')
			 	  .html(method.toUpperCase() + ' ' + url)
			 	  .appendTo(main);
		// 更新时间
		if(updateTime) {
			$('<div>').addClass('update_time')
					  .html(updateTime)
					  .appendTo(main);
		}
		// 接口描述
		if(text) {
			$('<div>').addClass('content')
					  .html(text)
					  .appendTo(main);
		}
		// 请求地址
		$('<div>').addClass('bar')
				  .html('请求地址')
				  .appendTo(main);
		$('<div>').addClass('content')
				  .html(root + url)
				  .appendTo(main);
		// 请求参数
		if(parameterCount > 0) {
			var box = $('<div>');
			$('<div>').addClass('bar')
					  .html('请求参数')
					  .appendTo(main);
			for(var i = 0; i < parameterCount; i++) {
				var param = parameters[i],
					grid = $('<div>').addClass('parameter').appendTo(box),
					field = $('<span>').addClass('param').html(param.field).appendTo(grid),
					require = $('<span>').html(param.required ? '必选' : '可选').appendTo(field),
					text = $('<p>'),
					acceptValue = $('<p>'),
					defaultValue = $('<p>'),
					sampleValue = $('<p>');
					
				if(param.text) {
					text.html(param.text)
						.appendTo(grid);
				}
				if(param.acceptValue) {
					$('<strong>').html('允许值：')
								 .appendTo(acceptValue);
					$('<span>').html(param.acceptValue)
							   .appendTo(acceptValue);
					acceptValue.appendTo(grid);
				}
				if(param.defaultValue) {
					$('<strong>').html('默认值：')
								 .appendTo(defaultValue);
					$('<span>').html(param.defaultValue)
							   .appendTo(defaultValue);
					defaultValue.appendTo(grid);
				}
				if(param.sampleValue) {
					$('<strong>').html('示例值：')
								 .appendTo(sampleValue);
					$('<span>').html(param.sampleValue)
							   .appendTo(sampleValue);
					sampleValue.appendTo(grid);
				}
			}
			box.addClass('content')
			   .appendTo(main);
		}
		
		// 请求示例
		if(requestSample) {
			highlight = true;
			$('<div>').addClass('bar')
					  .html('请求示例')
					  .appendTo(main);
			var grid = $('<div>').addClass('content')
			  					 .appendTo(main);
			if(method.toLowerCase() == 'get') {
				grid.html(root + url + requestSample);
			} else {
				$('<pre>').addClass('prettyprint')
						  .html(requestSample)
						  .appendTo(grid);
			}
		}
		
		// 返回结果
		if(responseSample) {
			highlight = true;
			$('<div>').addClass('bar')
					  .html('返回结果')
					  .appendTo(main);
			$('<pre>').addClass('prettyprint')
					  .html(responseSample)
					  .appendTo($('<div>').addClass('content')
					  					  .appendTo(main));
		}
		
		if(highlight) {
			prettyPrint();
		}
	}
});

var Foot = Backbone.Model.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		$('<a>').attr('href', homepage)
				.attr('hidefocus', true)
				.html('oDocument ' + version)
				.appendTo('.foot');
	}
});

var Model = Backbone.Model.extend({
	defaults: {
		doc: null,
		router: null
	}
});

var View = Backbone.View.extend({
	initialize: function() {
		var doc = this.options.doc,
			url = this.options.url,
			_ = this;
		if(doc) {
			this.render(doc);
		} else {
			if(!url) {
				url = 'oDocument.json';
			}
			$.ajax({
				url: url,
				dataType: 'json',
				success: function(json) {
					_.render(json);
				},
				error: function(jqxhr, text, error) {
					if(text == 'parsererror') {
						alert('JSON转换失败');
					} else {
						alert(text);
					}
				}
			});
		}
	},
	render: function(doc) {
		var router = new Router();
		
		this.model = new Model({doc: doc, router: router});
		
		navi = new Navi({model: this.model});
		sidebar = new SideBar({model: this.model});
		description = new Description({model: this.model});
		module = new Module({model: this.model});
		api = new API({model: this.model});
		foot = new Foot();
		
		Backbone.history.start();
		navi.render();
	}
});

win.oDocument = View;
})(jQuery);