"use strict";

/**
 * shelly - A pure and vanilla shell-like interface for the web.
 * 
 * @author Er Galvão Abbott <galvao@galvao.eti.br>
 * @version 0.3.0-beta
 * @link https://github.com/galvao-eti/shelly
 */

class Shelly
{
    clientCommands = shellyCommands(this);
    config = "";

    id = "";
    rootElement = {};
    currentLine = {};

    history = [];
    historyCount = 0;
    cursor = -1;

    responseType = 'application/json';

    constructor(config, lazyInit = true)
    {
        try {
            this.config = JSON.parse(config);
        } catch (e) {
            throw(e);
        }

        this.id = Shelly.generateRandomString();
        this.rootElement = document.createElement('div');
        this.rootElement.id = this.id;

        if (this.config.useLocalStorage === true) {
            this.history = localStorage.getItem('shelly').split('<!>');
        }

        if (lazyInit) {
            this.init();
        }
    }

    init()
    {
        this.showMotd();
        this.newLine();
        document.body.appendChild(this.rootElement);
    }

    showMotd()
    {
        let element = document.createElement('pre');

        if (this.config.MOTD.length > 0) {
            element.insertAdjacentHTML('afterBegin', this.config.MOTD);
            element.setAttribute('class', 'motd');

            this.rootElement.appendChild(element);
        }
        
        return;
    }   

    newLine()
    {
        let id = null;
        id = '#' + this.id;
        let lineElement = document.createElement('span');
        lineElement.setAttribute('class', 'line');

        let observer = new MutationObserver(function (lines, observer) {
            let children = lines[lines.length - 1].addedNodes;
            children.item(0).focus();

            observer.disconnect();
        });

        observer.observe(lineElement, {childList: true, subTree: true});

        let promptElement = document.createElement('span');

        promptElement.setAttribute('class', 'prompt');
        promptElement.insertAdjacentText(
            'afterBegin',
            this.config.user.name + '@' + this.config.API.address + this.config.user.qualifier + '> '
        );

        let readLineElement = document.createElement('input');
        readLineElement.setAttribute('class', 'readline');

        let responseElement = document.createElement('div');
        responseElement.setAttribute('class', 'response');

        lineElement.appendChild(promptElement);
        lineElement.appendChild(readLineElement);

        this.rootElement.append(lineElement);
        this.rootElement.appendChild(responseElement);

        let lines = this.rootElement.querySelectorAll('.readline');
        this.currentLine = lines.item((lines.length === 0 ? 0 : lines.length - 1));

        this.currentLine.addEventListener('keydown', async (e) => {
            if (e.code === 'ArrowUp') {
                e.target.value = this.scrollHistoryUp();
            } else if (e.code === 'ArrowDown') {
                e.target.value = this.scrollHistoryDown();
            } else if (e.code === 'Enter') {
                let input = e.target.value;

                this.addHistory(input);

                let data = await this.process(e.target);
                let dataElement = document.createElement('pre');

                if (this.config.debug === true) {
                    console.table(data);
                }
                
                if (typeof processResponse === 'function') {
                    let processResult = processResponse(data);

                    if (processResult instanceof HTMLElement) {
                        dataElement = processResult;   
                    }
                } else {
                    if (this.responseType.includes('text/html')) {
                        dataElement = document.createElement('div');
                        dataElement.insertAdjacentHTML('afterBegin', data.response);
                    } else {
                        dataElement.insertAdjacentText('afterBegin', data.response);
                    }
                    
                    dataElement.setAttribute('class', 'data');
                    lineElement.appendChild(dataElement);
                }

                if (e.target.value !== 'exit') {
                    this.newLine();
                }
            }
        });

        return;
    }

    async process(element)
    {
        let data = {};

        let input = element.value.trim();
        element.setAttribute('disabled', true);

        let command = input.trim().split(' ').shift();

        if (typeof this.clientCommands === 'object' && typeof this.clientCommands[command] === 'function') {
            data.response = this.clientCommands[command]();

            this.responseType = 'application/json';

            return data;
        }

        if (input === '') {
            return input;
        }

        let url = this.config.API.proto + this.config.API.protoSeparator + this.config.API.address;
        url += (this.config.API.port !== null ? ':' + this.config.API.port : '') + this.config.API.urlSeparator + this.config.API.endpoint;

        let request = new Request(url, {
            method: this.config.API.method,
            mode: (this.config.API.CORS === true ? "cors" : "same-origin"),
            headers: {
                "SHELLY-INPUT": input,
                "SHELLY-CSRF-TOKEN": document.head.querySelector('meta[name=shellyCsrfToken]').content
            }
        });

        const response = await fetch(request);
        this.responseType = response.headers.get("content-type");

        if (this.responseType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            if (typeof data.response === 'undefined') {
                data = {"response": "Error processing the request."};
            }
        }
        
        return data;
    }

    addHistory(input)
    {
        if (!this.config.storeDuplicates && this.history[this.cursor] === input) {
            return;
        }

        this.history.push(input);
        
        if (this.history.length > this.config.history.maxLength) {
            this.history.shift();
        }

        if (this.config.history.useLocalStorage) {
            try {
                localStorage.setItem('shellyHistory', this.history.join('<!>'));
            } catch (e) {
            }
        }

        this.historyCount = this.history.length;
        this.cursor = this.historyCount - 1;
    }

    scrollHistoryUp()
    {
        if (this.cursor <= 0) {
            return (this.history[0] === undefined) ? "" : this.history[this.cursor];
        }

        let result = this.history[this.cursor];

        this.cursor--;

        if (this.cursor < 0) {
            this.cursor = this.historyCount - 1;
        }

        return result;
    }

    scrollHistoryDown()
    {
        if (this.cursor === (this.historyCount- 1)) {
            return "";
        }

        this.cursor++;

        return this.history[this.cursor];
    }

    static generateRandomString(method = 'random', length = 8)
    {
        if (method === 'date') {
            return Date.now();
        }

        let result = '';

        let characters = Array.prototype.concat (
            Array(25).fill().map((element, index) => String.fromCharCode('A'.charCodeAt(0) + index)),
            Array(25).fill().map((element, index) => String.fromCharCode('a'.charCodeAt(0) + index))
        );

        let charCount = characters.length;

        for (let c = 0; c < length; c++) {
            let rnd = Math.floor(Math.random() * charCount);

            result += characters[rnd];
        }

        return result;
    }
}