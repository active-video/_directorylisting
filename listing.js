(function(){
    var sampleConfig = {
        "title" : "Apps Folder",
        
        "overrides" : {
            "_applauncher/" : ["App Launcher", "_applauncher/html/"],
            "_users/"       : "User Folders"
        },
        
        "before": {
            "Some Id"   : ["Label for link", "relative or absolute URL", "a protocol string such as webkit/tag/webkitrl or the value true as a Boolean to indicate you want to trigger __openUrl__()"],
            "tag" : ["Tag Games", "tag:/"],
            "poker" : ["Tag Games - Poker", "tag:/poker"],
            "YouTube Bruteforce"       : ["YouTube Bruteforce", "http://youtube.com/leanback", "webkit-brute"],
            "render-layer-demo" : ["Render Layer Sample (webkitrl) - using this folder", "./", "webkitrl"],
            "new-root-session" : ["A new /apps session using webkit (not webkitrl)", "/apps", "webkit"]
        },
        
        "after": {
            "last link"   : ["Last Link", "http://www.yahoo.com/#lastLinkYay"]
        }
        
    };
    var documentation = "Directory Listing Configuration Readme:\r\nin the current directory (" + location.pathname + ") include a file called config.json, of the format:\r\n" + JSON.stringify(sampleConfig, null, "\t");
    document.write('<center><h1>Directory: ' + location.pathname + '</h1></center>');
    
    var up, first, links, nav 
    
    //This is how many directories deep we are currently
    , depth = getDepth() 
    
    //last_X will make the cookies not carry forward to sub-folders
    //only state for current depth
    //NOTE: cookies are purged at end of session by user-agent, not persistent
    //this approach removes the need for doing window.open() to preserve current
    //state
    , cookieName = 'last_'+depth;
    
    /**
     * On Load events
     */
    var onLoad = function(){
    
        var config = getConfig();
        
        
        
        var up = null;
        var first = getLink(0);
        
        
        
        var overrides = (config && config.overrides) || {};
        //copy to the overrides everything extra in config, and insert them into the DOM 
        //using the template DOM reference element first.cloneNode(true);
        overrides = mergeLinks(overrides, config);
        
        
        //get first again, since it's changed if any config.before overrides
        var first = getLink(0);
        
        links = Array.prototype.slice.call(document.querySelectorAll('a'));
        
        
        
        
        
        //find up link, the link just after the "up on directory" link
        //and apply any overrides from config.json
        for(var i=0; i<links.length; i++){
            var link = links[i];
            var url = links[i].getAttribute('href');
            if((url.indexOf('/') === 0 || url.indexOf('../') === 0) && url.length <= 3){
                up = links[i];
                
                
                
                continue;
            }

            if(typeof(overrides[url]) != 'undefined'){
                var override = overrides[url];
                if(override instanceof Array){
                    links[i].innerHTML = override[0];
                    if(override[1]){
                        links[i].setAttribute('href', override.length > 3 ? override[3] : override[1]);
                    }
                    
                    //console.log('original ', links[i].getAttribute('href'));
                    var programUrl = getProgramUrl(links[i].href, override[2] );
                    //console.log(links[i].href + '-->' + programUrl, override);
                    
                    if(programUrl){
                        //will be absolute if using .href property
                        links[i].setAttribute('href', programUrl);//get an absolute URL so that we can get the protocol right
                    }
                    
                }else{
                    links[i].innerHTML = override;
                }
            }else{
                var type = '';
                try{type = link.parentElement.parentElement.querySelector('img').alt;}catch(eNoTypeCol){}
                //console.log(link, type);
                
                if(type == '[VID]'){
                    links[i].setAttribute('href', 'javascript:playVideo("'+url+'")');
                }
            }
            
        }
        
        //export links for debugging in console
        window.links = Array.prototype.slice.call(document.querySelectorAll('a'));
        window.config = config;
        
        var first = getLink(0);
        
        
        //do any DOM tranformations desired
        if(config && config.title){
            document.querySelector('h1').innerHTML = config.title;
        }
        
        //create keyboard navigation
        nav = new av.Navigation();
        nav.addSelector('a');
        
        //focus the last page (if selected)     
        var last = getCookie(cookieName);
        var index = last ? parseInt(last,10) : -1;
        //console.log("Focus", index, first, up, links);
        if(index >= 0 && links.length > index){
            links[index].focus();
            document.cookie = cookieName+"=-1";//reset
        }else if(first){
            first.focus();
        }else if(up){
            up.focus();
        }else{
        	document.querySelectorAll('a')[4].focus();
        }
        
        
        
    }
    
    var mergeLinks = function(overrides, config){
        var types = ['before', 'after'];
        
        //we always insert before first, so can be locked in now
        var first = getLink(0);
        
        var index = 0;
        
        for(var i=0; i<types.length; i++){
            var links = config && config[types[i]] ? config[types[i]] : {};
            for(var prop in links){
                var link = links[prop] ;
                link = link instanceof Array  ? link : [link, link];
                link[3] = link[1];//keep original
                link[1]+='#'+index;//avoid overrides
                
                overrides[link[1]] = link;
                
                //insert into DOM, i = 0 indicates we want the links inserted, i > 0 means append to end
                var neighbor = types[i] == 'before' ? first : getLink(-1);
                
                var domNode = addTo(link, i, neighbor)
                //console.log("Added " + types[i] + " the link", link, "DOM Node is:", domNode);
                
                index++
            }     
        }

        
        return overrides;
    }
    
    /**
     * elements - an object
     */
    var addTo = function(link, atEnd, domNode){
        if(!link || !domNode) return;
        
        var trNode = domNode.parentNode.parentNode;
        var container = trNode.parentNode;
        
        var tr = populateTr(trNode, link[1], link[0]);
                
        if(!container.hasChildNodes() || (atEnd && !trNode.nextSibling)){
	        container.appendChild(tr);
        }if(!atEnd){
        	//console.log(container, 'adding ', tr, ' before ', trNode)
            container.insertBefore(tr, trNode);
        }else{
            container.insertBefore(tr, trNode.nextSibling);
        }
        return tr;
    }
    
    
    var updateTime = window.updateTime = function(videoElement){
        var p = videoElement.ownerDocument.getElementById('progress');
        p.innerHTML = 'Currently ' + Math.round(videoElement.currentTime) + ' of ' + Math.round(videoElement.duration);  
        console.log(videoElement.currentTime);
    }
    
    /**
     * Get link with the specified index (can use negative to count from end) within the list of URL links in directory listing when called, may change during load/runtime if DOM is manipulated and links inserted/removed
     */
    var getLink = window.getLink = function(index){
        var links = Array.prototype.slice.call(document.querySelectorAll('a'));
        
        var up = first = null;
        var firstIndex = null;
        
        //find the first link in the file director
        for(var i=0; i<links.length; i++){
            var link = links[i];
            var url = links[i].getAttribute('href');
            //console.log(url.length ,url)
            if((url.indexOf('/') === 0 || url.indexOf('../') === 0) && !up){
                up = links[i];
                continue;
            }
            
            if(up && !first){
            	first = links[i];
            	firstIndex = i;
            	//if we know the 1st link, we can calculate the negative indices
            	if(index < 0){
            		index = links.length + index - firstIndex;
            		//alert(index + ' - ' + links.length);
            	}
            }
            
			var linkIndex = i - firstIndex;
            //console.log(first, firstIndex, 'i='+i, 'linkIndex='+linkIndex, 'index='+index, links[i], i=== index);
            if(first && linkIndex === index){
                return links[i];
            }
            
        }
        return up;
    }
    
    var populateTr = function(tr, url, name){
        var tr = tr.cloneNode(true)
        tr.querySelector('a').setAttribute('href', url);
        tr.querySelector('a').innerHTML = name || url
        
        Array.prototype.slice(tr.querySelectorAll('td')).forEach(function(td, index){
            if(index > 1) td.innerHTML = '';//don't do the first couple (icon and link)
        })
        
        //replace image with a standard link icon
        var img = tr.querySelector('img');
        img.src = img.src.substring(0, img.src.lastIndexOf('/') + 1) + 'text.gif';
        
        return tr;
    }
    
    var getProgramUrl = function(url, engine){        
        /**
         * Will use either what was included as a parameter, or will introspect on the URL and best-guess
         */
        var applicationEngine = typeof(engine) == 'string' ? engine : ''; 
        var autoDetect = typeof(engine) == 'undefined' || engine === true;
        var programUrl = '';
        
        //if it has not         
        var regex = /(^[a-zA-Z]*):/;
        var protocol = url.match(regex).length && url.match(regex)[1];
        
        //if we are autodetecting, and it's simple HTTP, return
        if(autoDetect && (protocol == 'http' || protocol == 'https')){
			return '';
        }else if(protocol == 'http' || protocol == 'https'){
            applicationEngine = applicationEngine || 'webkit';//default to webkit
            programUrl = url;
            //console.log('external',applicationEngine, programUrl, url);
        }else{
            applicationEngine = applicationEngine || protocol;//if not explicitly set, auto detect from URL
            
            //IF url includes protocol, strip it 
            if(url.indexOf(applicationEngine) === 0){
                programUrl = url.substring(applicationEngine.length+1);
            }else{//url doesn't include the protocol, we'll append it later
                programUrl = url;
            }
            //console.log('external',applicationEngine, programUrl, url);
        }
        
        var linkUrl = "javascript:launchProgram('"+applicationEngine + ":" + programUrl+"')";
        return linkUrl;
        
    }
    
    var playVideo = window.playVideo = function(url){
        var mediaWindow = window.open('about:blank');
        mediaWindow.console = console;
        mediaWindow.document.write('<html><head></head>'
           + '<body style="background-color:black">'
           + '<video ontimeupdate="window.opener.updateTime(this);" '
           + '     style="width:80%; height:80%; position:relative; top:10%; left:10%; clear:both; outline:10px solid white;" src="'+url+'" autoplay loop ></video>'
           + '<div id="progress" style="text-align:center; padding:20px; font-size:30px; color:white;"></div></body></html>'
        );
        
    }
    
    var launchProgram = window.launchProgram = function(url){
        if(typeof(__openUrl__) == 'function'){
	        console.log("__openUrl__('"+url+"')");
        	__openUrl__(url);
        }else{
        	var message = 'This link will only work in CloudTV:\n========\n' + url + "\n========";
        	console.warn(message);
        	alert(message);
        }
    }
    
    /**
     * On Key Down events
     */
    var onKeyDown = function(evt){
        if(evt.keyCode == 13){
            var cookieString = '';
            if(evt.target == up){
                cookieString = cookieName + "=-1";//clear out selection
            }else{
                cookieString = cookieName + "=" + links.indexOf(evt.target);
            }
            //alert(cookieString)
            document.cookie = cookieString;
            
        }
    }
    

    /**
     * Track Selection to preserve state when returning
     */ 
    window.addEventListener('keydown', onKeyDown)
    
    /**
     * Get config.json from the current directory
     */
    var getConfig = function(){
        var x = new XMLHttpRequest();
        x.open("GET","config.json",false);
        x.send();
        
        var c = {};
        
        try{
            c = JSON.parse(x.responseText);
        }catch(eNotJson){
            console.warn("To configure the directory listing script, create a config.json in this directory.", eNotJson.message);
        }
        
        return c;
    }
    
    /**
     * Subscribe to DOM ready event
     */ 
    av.onDomReady(onLoad)

})()