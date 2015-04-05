var app = (function(){

    return { 

        initModule: function(module, after_begin){
        	//add css to head
        	var file_css = document.createElement("link");
        	file_css.setAttribute("rel", "stylesheet")
            file_css.setAttribute("type", "text/css")
            file_css.setAttribute("href", module.css);
        	document.head.appendChild(file_css);

        	//load html in body
           	var xhr = new XMLHttpRequest();
        	xhr.open('GET', module.html, false);
        	xhr.onreadystatechange = function() {
        		if (xhr.readyState != 4) return;
                if(after_begin){
                   document.body.insertAdjacentHTML("afterBegin",xhr.responseText); 
                }else{
                    document.body.insertAdjacentHTML("beforeEnd",xhr.responseText);
                }
        	}
        	xhr.send(null);
            
        	//add js to end of body
        	var file_js = document.createElement('script')
        	file_js.setAttribute("type","text/javascript")
            file_js.setAttribute("src", module.js)
            document.body.appendChild(file_js);
            window[module.name] = module;
        },

        deleteModule : function(module){
            delete window[module.name];

            //delete css link
            var links = document.head.getElementsByTagName("link");
            for(var i=0; i<links.length; i++){
                var href = links[i].getAttribute("href");
                if(href == module.css){
                    document.head.removeChild(links[i]);
                }
            }

            //delete container
            var container = document.getElementById(module.block_id);
            document.body.removeChild(container);
            
            
            //delete script
            var scripts = document.body.getElementsByTagName("script");
            for(var i=0; i<scripts.length; i++){
                var src = scripts[i].getAttribute("src");
                if(src == module.js){
                    document.body.removeChild(scripts[i]);
                }
            }
        },

        eventHandler : function(event){
            var id = event.target.getAttribute('id');
            var class_atrr = event.target.getAttribute('class');
    
            if(id == 'index_container'){
                var element = document.getElementById('index_container');
                document.body.removeChild(element);
                app.initModule(screen_manager.grid_module,true);
            }
            if(id == 'grid_synchronized'){
                    goSchedule(); //call from grid.js 
            }
            if(id == 'sync_button'){
                    loadJournal(); // call from schedule.js
            }
            if(id == 'select_scheduled' && event.type =='change'){
                if(event.target.selectedIndex == 0){
                    showScheduleBox(); // call from schedule.js
                }else{
                    hideScheduleBox(); // call from schedule.js
                }
            }
            if(class_atrr == 'sync_journal_row'){
                var date = event.target.parentNode.getAttribute('id');
            
                if(!window[screen_manager.sync_details_module.name]){
                    app.initModule(screen_manager.sync_details_module,false); 
                    var group_by_type = groupByTypeWithDate(screen_manager.schedule_module.json_data, date);//call from schedule.js
                    alert('output in console');
                    console.log(group_by_type);
                }else{
                    var group_by_type = groupByTypeWithDate(screen_manager.schedule_module.json_data, date);//call from schedule.js
                    alert('output in console');
                    console.log(group_by_type);
                }

                
            }
        },
        errorHandler : function() {
                alert('Catch Error');
                if(window[module.name] === screen_manager.schedule_module.name){ // return to grid.html
                    if(window[screen_manager.sync_details_module.name]){
                        app.deleteModule(screen_manager.sync_details_module);
                    }
                    app.deleteModule(screen_manager.schedule_module);
                    app.initModule(screen_manager.grid_module,true);
                    return;
                }

                if(window[module.name] === screen_manager.grid_module.name){ //return to index.html
                    app.deleteModule(screen_manager.grid_module);
                    location.reload();
                    return;
                }
                
        }
    };
})();
 
