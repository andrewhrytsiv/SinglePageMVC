function showProgressbar(){
	document.getElementById('progress_bar_box').style.visibility = "visible";
}

function hideProgressbar(){
	document.getElementById('progress_bar_box').style.visibility = "hidden";	
}

function setProgressbar(width){
    document.getElementById('progress_bar').style.width = width + "px";
}

function getProgressbar(){
    var width = document.getElementById('progress_bar').style.width;
    return Number.parseInt(width);
}

function addProgressbar(add_width){
    var width = getProgressbar();
    setProgressbar(width+add_width);
}

function clearProgressbar(){
	document.getElementById('progress_bar').style.width = "0px";
    document.getElementById('progress_bar').innerHTML = '';
}

function set100Text(){
    document.getElementById('progress_bar').innerHTML = '100%';
}
function setLastSynchronizationDate(date){
    document.getElementById('last_synchronization_date').innerHTML = date;
}
//format dd.mm.yy
function formatDate(date) {
  var dd = date.getDate()
  if ( dd < 10 ) {
    dd = '0' + dd;
  }
  var mm = date.getMonth()+1
  if ( mm < 10 ) {
    mm = '0' + mm;
  }
  var yy = date.getFullYear() % 100;
  if ( yy < 10 ){ 
    yy = '0' + yy;
  }
  return dd+'.'+mm+'.'+yy;
}
// dd. Month yyyy hour:min
function formatDateSynchronization(date) {
    var dd = date.getDate();
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if ( dd < 10 ) {
        dd = '0' + dd;
    }
    var mm = monthNames[date.getMonth()];
    var yy = date.getFullYear();
    var hour = date.getHours();
    var min = date.getMinutes();
    if(min < 10){
        min = '0' + min;
    }
    return dd+'. '+mm+' '+yy+' '+hour+':'+min;
}

//show schedule_box
function showScheduleBox(){
    document.getElementById('schedule_box').style.visibility = "visible";
}

//hide schedule_box
function hideScheduleBox(){
    document.getElementById('schedule_box').style.visibility = "hidden";
}

//add row with data in sync_journal_table
function addJournalTableRow(element){
    var table = document.getElementById('sync_journal_table');
    var tr = document.createElement('tr');
    tr.setAttribute("id", element.date);
    //date
    var date_th = document.createElement('td');
    date_th.setAttribute("class", "sync_journal_row");
    date_th.innerHTML = formatDate(new Date(parseInt(element.date)));
    tr.appendChild(date_th);
    //state
    var state_th = document.createElement('td');
    state_th.setAttribute("class", "sync_journal_row");
    state_th.innerHTML = element.state;
    tr.appendChild(state_th);
    //conflict
    var conflict_th = document.createElement('td');
    conflict_th.setAttribute("class", "sync_journal_row");
    conflict_th.innerHTML = element.conflict;
    tr.appendChild(conflict_th);
    //syn_elements
    var syn_elements_th = document.createElement('td');
    syn_elements_th.setAttribute("class", "sync_journal_row");
    syn_elements_th.innerHTML = element.synch_elements;
    tr.appendChild(syn_elements_th);
    //add row
    table.appendChild(tr);

}
//comparator for journal elemnts sort
function compare(a,b){
    if (a.date > b.date){
        return -1;   
    }
    if (a.date < b.date){
        return 1;
    }
    return 0;
}
//load journal json data from server
function loadJournal(){ 
    clearProgressbar();
    showProgressbar();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/sync_journal.json', true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4){
            if(xhr.readyState == 2){
               setProgressbar(160/10);//10% 
            }
            if(xhr.readyState == 3){
               if( getProgressbar() < 128 ){ //80%
                    addProgressbar(160/10);//10% 
               }
            }
            return;
        }
        setProgressbar(144); //90%
        var response = xhr.responseText;
        try{
            var elements = JSON.parse(response);
            //save elements in schedule_module
            screen_manager.schedule_module.json_data = elements;
            var sort_date_elements = groupByDate(elements);
            var sync_journal = buildJournal(sort_date_elements);
            sync_journal.sort(compare);
            cleanSyncJournalTable();
            for(var i=0; i<sync_journal.length; i++){
                addJournalTableRow(sync_journal[i]);
            }
            setLastSynchronizationDate(formatDateSynchronization(new Date()));
        }catch (e){
            alert("error loading data");
        }
        setProgressbar(160);  //100%  
        set100Text();
        setTimeout(hideProgressbar,1000);
    }
    xhr.send(null);
}
//group json elements by date
function groupByDate(elements){
    var sort_date_elements = {};
        for(var i=0; i<elements.length; i++){
            if(!sort_date_elements[elements[i].syncDate]){
                sort_date_elements[elements[i].syncDate] = [];
                sort_date_elements[elements[i].syncDate].push(elements[i]);
            }else{
                sort_date_elements[elements[i].syncDate].push(elements[i]);
            }   
        }
    return sort_date_elements;
}
//group json elements(date) by type 
function groupByTypeWithDate(elements,date){
    var elements_with_date = [];
    for(var i=0; i<elements.length; i++){
        if(elements[i].syncDate == date){
            elements_with_date.push(elements[i])
        }
    }
    var type_map = {};
    for(var i=0; i<elements_with_date.length; i++){
        var elem = elements_with_date[i];
        if(type_map[elem.type]){
            type_map[elem.type].push(elem);         
        }else{
            type_map[elem.type] = [];
            type_map[elem.type].push(elem);         
        }
    }
    return type_map;
}
//convert json in table elements
function buildJournal(sort_date_elements){
            var sync_journal  = [];
            for(var date in sort_date_elements){
                var journal_element = {
                    conflict : 0,
                    state : "ok"
                };
                journal_element.date = date;
                journal_element.synch_elements = sort_date_elements[date].length;
                for(var i=0; i<sort_date_elements[date].length; i++){
                    var element = sort_date_elements[date][i];
                    if(element["status"].toUpperCase() == "ERROR"){
                        journal_element.state = "failed"
                    }
                    if(element["status"].toUpperCase() == "CONFLICT"){
                        journal_element.conflict += 1;
                    }
                }
                if(journal_element.conflict === 0){
                    journal_element.conflict = 'none';
                }
                sync_journal.push(journal_element);
            }
            return sync_journal;
}
//clean sync_journal_table and add head
function cleanSyncJournalTable(){
    var table = document.getElementById('sync_journal_table');
    table.innerHTML = '<tr><th class="sync_journal_header"> Date </th><th class="sync_journal_header"> State </th> <th class="sync_journal_header"> Conflict </th><th class="sync_journal_header"> synch_elements </th></tr>';
}