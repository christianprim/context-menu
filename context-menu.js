define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui", "commands", "menus", "run", "console", "fs", "tabManager", "proc", "Dialog"
    ];
    main.provides = ["context-menu"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var ui = imports.ui;
        var menus = imports.menus;
        var commands = imports.commands;
        var run = imports.run;
        var console_panel = imports.console;
        var fs = imports.fs;
        var tabs = imports.tabManager;
        var proc = imports.proc;
        var Dialog = imports.Dialog;
        var OK_pressed = false;

        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();

        var commit_dialog = new Dialog("Christian Prim", main.consumes, {
                name: "context-menu",
                allowClose: true,
                title: "Prüfung",
                heading: "Git aktualisieren",
                body: "Benennen Sie die gemachte Änderung",
                elements: [
                    { type : "textbox", id : "message", width : 300 },
                    { type : "label", id : "empty_message", caption: "!", style: "color:rgb(255, 0, 0);", visible : false },
                    { type : "filler" },
                    { type: "button", id: "cancel", color: "gray", caption: "Abbrechen", hotkey : "ESC", onclick: function(){commit_dialog.hide()} },
                    { type: "button", id: "ok", color: "green", caption: "OK", "default": true, onclick: function()
                        {if (commit_dialog.getElement("message").value ==="") { 
                            commit_dialog.update([{ id : "empty_message", visible : true }]);
                        }
                        else {
                            OK_pressed = true;
                            commit_dialog.update([{ id : "empty_message", visible : false }]);
                            commit_dialog.hide();
                        }
                        
                        } 
                        
                    }
                ]
            });
        
        function load() {
            commands.addCommand({
                name: "aufgaben",
                bindKey: { mac: "Command-Shift-A", win: "Ctrl-Shift-A" },
                isAvailable: function(){ return true; },
                exec: function() {
                    proc.spawn('/bin/bash',{args : ["/home/ubuntu/.c9/plugins/context.menu/compile.sh"], 
                                env : {'DOCUMENT' : 'aufgaben'},
                                cwd : "/home/ubuntu/workspace/documents/pruefungen"
                                },
                                function(err,process) {
                                    if (err) throw err.message;
                                });
                }
            }, plugin);
            
            commands.addCommand({
                name: "musterloesung",
                bindKey: { mac: "Command-Shift-M", win: "Ctrl-Shift-M" },
                isAvailable: function(){ return true; },
                exec: function() {
                    proc.spawn('/bin/bash',{args : ["/home/ubuntu/.c9/plugins/context.menu/compile.sh"], 
                                env : {'DOCUMENT' : 'musterloesung'},
                                cwd : "/home/ubuntu/workspace/documents/pruefungen"
                                },
                                function(err,process) {
                                    if (err) throw err.message;
                                });
                }
            }, plugin);
            
            commands.addCommand({
                name: "aufraeumen",
                bindKey: { mac: "Command-Shift-X", win: "Ctrl-Shift-X" },
                isAvailable: function(){ return true; },
                exec: function() {
                    proc.spawn('/bin/bash',{args : ["-c","rm *.pgf *.tuc *.log"],
                        cwd : "/home/ubuntu/workspace/documents/pruefungen"},
                        function(err,process){
                        process.stdout.on('data',function(data) {
                            console.log('stdout: ' + data);
                        });
                        process.stderr.on('data',function(data) {
                            console.log('stderr: ' + data);
                        });
                        if (err) console.log(err.message);
                    });
                }
            }, plugin);
            
            commands.addCommand({
                name: "updateGit",
                bindKey: { mac: "Command-Shift-U", win: "Ctrl-Shift-U" },
                isAvailable: function(){ return true; },
                exec: function() {
                        proc.spawn('/usr/bin/nawk',{args : ["-f","/home/ubuntu/.c9/plugins/context.menu/update-git.awk", 
                        "/home/ubuntu/workspace/documents/pruefungen/auswahl.tex"]},function(err,process) {
                        process.stdout.on('data',function(data) {
                            var commit_msg = data;
                            commit_dialog.show(commit_msg,function(message){ 
                                proc.spawn('/bin/bash',{args : ["/home/ubuntu/.c9/plugins/context.menu/update-git.sh"], 
                                env : {"MESSAGE" : message}, 
                                cwd : "/home/ubuntu/workspace/documents/pruefungen"
                                },
                                function(err,git_process) {
                                    git_process.stdout.on('end',function() {
                                        fs.exists("/documents/pruefungen/git_out.log", function(exists) {
                                            if (exists) {
                                                console_panel.open({
                                                    path       : "/documents/pruefungen/git_out.log",
                                                    active     : true,
                                                    demandExisting : true,
                                                }, function(){});
                                            }
                                        });
                                    });
                                    if (err) console.log(err.message);
                                });
                            });
                        });
                        process.stderr.on('data',function(data) {
                            console.log('stderr: ' + data);
                        });
                        if (err) console.log(err.message);
                    });
                }
            }, plugin);
            
            
            menus.setRootMenu("Prüfung", 650, plugin);
            menus.addItemByPath("Prüfung/Aufgabenblatt", new ui.item({ command : "aufgaben" }), 100, plugin);
            menus.addItemByPath("Prüfung/Musterlösung", new ui.item({ command : "musterloesung" }), 200, plugin);
            menus.addItemByPath("Prüfung/~", new ui.divider(), 250, plugin);
            menus.addItemByPath("Prüfung/Aufräumen", new ui.item({ command : "aufraeumen" }), 300, plugin);
            menus.addItemByPath("Prüfung/Git aktualisieren", new ui.item({ command : "updateGit" }), 400, plugin); 
        }
        

        /***** Methods *****/
        
        function show(msg,onok) {
            return commit_dialog.queue(function(){
                
                commit_dialog.once("draw",function(){
                    commit_dialog.getElement("message").setAttribute("value",msg);
                    OK_pressed = false;
                });
                commit_dialog.on("hide", function(){
                    if (OK_pressed) { 
                        onok && onok(commit_dialog.getElement("message").value);
                    }
                });
            });
        }
        
        /***** Register *****/

        /**
         * @internal Use dialog.alert instead
         * @ignore
         */
        commit_dialog.freezePublicAPI({
            /**
             * @readonly
             */
            get message(){ 
                return commit_dialog.getElement("message").value;
            },

            /**
             * Show an alert dialog.
             * 
             * @param {String} [msg]       The message to display
             * @param {Function} [onok]  The function to call after it's closed.
             */
            show: show
        });
        
        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });
        plugin.on("unload", function() {
            OK_pressed = false;
        });
        

        register(null, {
            "context-menu": plugin
        });
    }
});