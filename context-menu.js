define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui", "commands", "menus", "run", "console"
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

        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit = plugin.getEmitter();
        
        var showing;
        function load() {
            commands.addCommand({
                name: "aufgaben",
                bindKey: { mac: "Command-Shift-A", win: "Ctrl-Shift-A" },
                isAvailable: function(){ return true; },
                exec: function() {
                    run.run({cmd: [ "context" , "aufgaben.tex" ], working_dir: "/home/ubuntu/workspace/documents/pruefungen", 
                        env: {'PATH' : '/home/ubuntu/workspace/context/tex/texmf-linux-64/bin:$PATH'}}, {}, 
                        function(err, pid) {
                        if (err) throw err.message;});
                    console.open({
                        editorType : "output", 
                        active     : true,
                        title      : "Aufgabenblatt",
                        document   : {
                                    title  : "Aufgabenblatt",
                                    output : {
                                        id : "output"
                                             }
                                     }
                    }, function(){});
                }
            }, plugin);
            
            commands.addCommand({
                name: "musterloesung",
                bindKey: { mac: "Command-Shift-M", win: "Ctrl-Shift-M" },
                isAvailable: function(){ return true; },
                exec: function() {
                    showing ? hide() : show();
                }
            }, plugin);
            
            commands.addCommand({
                name: "updateGit",
                bindKey: { mac: "Command-Shift-U", win: "Ctrl-Shift-U" },
                isAvailable: function(){ return true; },
                exec: function() {
                    showing ? hide() : show();
                }
            }, plugin);
            
            
            menus.setRootMenu("ConTeXt", 650, plugin);
            menus.addItemByPath("ConTeXt/Aufgabenblatt", new ui.item({ command : "aufgaben" }), 100, plugin);
            menus.addItemByPath("ConTeXt/Musterlösung", new ui.item({ command : "musterloesung" }), 200, plugin);
            menus.addItemByPath("ConTeXt/~", new ui.divider(), 250, plugin);
            menus.addItemByPath("ConTeXt/Git aktualisieren", new ui.item({ command : "updateGit" }), 300, plugin); 
        }
        
        var drawn = false;
        function draw() {
            if (drawn) return;
            drawn = true;
            
            emit("draw");
        }
        
        /***** Methods *****/
        
        function show() {
            draw();
            
            emit("show");
            showing = true;
        }
        
        function hide() {
            if (!drawn) return;
            

            emit("hide");
            showing = false;
        }
        
        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });
        plugin.on("unload", function() {
            drawn = false;
            showing = false;
        });
        
        /***** Register and define API *****/
        
        /**
         * This is an example of an implementation of a plugin.
         * @singleton
         */
        plugin.freezePublicAPI({
            /**
             * @property showing whether this plugin is being shown
             */
            get showing(){ return showing; },
            
            _events: [
                /**
                 * @event show The plugin is shown
                 */
                "show",
                
                /**
                 * @event hide The plugin is hidden
                 */
                "hide"
            ],
            
            /**
             * Show the plugin
             */
            show: show,
            
            /**
             * Hide the plugin
             */
            hide: hide,
        });
        
        register(null, {
            "context-menu": plugin
        });
    }
});