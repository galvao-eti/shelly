"use strict";

var shellyCommands = shellyCommands || (function (shelly) {
    const commands = {
        clear: function () {
            while (shelly.rootElement.firstChild) {
                shelly.rootElement.removeChild(shelly.rootElement.firstChild);
            }

            return "";
        },
        exit: function () {
            shelly.currentLine.setAttribute('disabled', true);
            return "";
        },
        whoami: function () {
            return shelly.config.user.name;
        }
    };

    return commands;
});