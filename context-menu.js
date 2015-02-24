define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui", "commands", "menus", "run", "console", "fs", "tabManager"
    ];
    main.provides = ["context-menu"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var ui = imports.ui;
        var menus = imports.menus;
        var commands = imports.commands;
        var run = imports.run;
        var console = imports.console;
        var fs = imports.fs;
        var tabs = imports.tabManager;

        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        function load() {
            commands.addCommand({
                name: "aufgaben",
                bindKey: { mac: "Command-Shift-A", win: "Ctrl-Shift-A" },
                isAvailable: function(){ return true; },
                exec: function() {
                    run.run({cmd: [ "context", "--nonstopmode", "aufgaben.tex" ], working_dir: "/home/ubuntu/workspace/documents/pruefungen", 
                        env: {'PATH' : '/home/ubuntu/workspace/context/tex/texmf-linux-64/bin:$PATH'}}, {},
                        function(err, pid) {
                        if (err) throw err.message;});
                    fs.exists("/documents/pruefungen/aufgaben.log", function(exists) {
                        if (exists) {
                            console.open({
                                path       : "/documents/pruefungen/aufgaben.log",
                                active     : true,
                                demandExisting : true,
                            }, function(){});
                        }
                    });
                    fs.watch("/documents/pruefungen/aufgaben.pdf", function(err,event,filename) {
                        if(event=="change") {
                            tabs.preview({
                                active          : true,
                                path            : "/documents/pruefungen/aufgaben.pdf",
                            }, function(err,tab,done){if (err) throw err.message;});
                        }
                        if (err) throw err.message;
                    });
                }
            }, plugin);
            
            commands.addCommand({
                name: "musterloesung",
                bindKey: { mac: "Command-Shift-M", win: "Ctrl-Shift-M" },
                isAvailable: function(){ return true; },
                exec: function() {
                    run.run({cmd: [ "context", "--nonstopmode", "musterloesung.tex" ], working_dir: "/home/ubuntu/workspace/documents/pruefungen", 
                        env: {'PATH' : '/home/ubuntu/workspace/context/tex/texmf-linux-64/bin:$PATH'}}, {},
                        function(err, pid) {
                        if (err) throw err.message;});
                    fs.exists("/documents/pruefungen/musterloesung.log", function(exists) {
                        if (exists) {
                            console.open({
                                path       : "/documents/pruefungen/musterloesung.log",
                                active     : true,
                                demandExisting : true,
                            }, function(){});
                        }
                    });
                    fs.watch("/documents/pruefungen/musterloesung.pdf", function(err,event,filename) {
                        if(event=="change") {
                            tabs.preview({
                                active          : true,
                                path            : "/documents/pruefungen/musterloesung.pdf",
                            }, function(err,tab,done){if (err) throw err.message;});
                        }
                        if (err) throw err.message;
                    });
                }
            }, plugin);
            
            commands.addCommand({
                name: "aufraeumen",
                bindKey: { mac: "Command-Shift-X", win: "Ctrl-Shift-X" },
                isAvailable: function(){ return true; },
                exec: function() {
                    run.run({cmd: [ "bash", "-c", "rm *.pgf *.tuc" ], working_dir: "/home/ubuntu/workspace/documents/pruefungen"}, {},
                        function(err, pid) {
                            if (err) throw err.message;
                        });
                    }
            }, plugin);
            
            commands.addCommand({
                name: "updateGit",
                bindKey: { mac: "Command-Shift-U", win: "Ctrl-Shift-U" },
                isAvailable: function(){ return true; },
                exec: function() {
                    //showing ? hide() : show();
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
        

        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });
        plugin.on("unload", function() {
            
        });
        

        register(null, {
            "context-menu": plugin
        });
    }
});