"use strict";

/**
 * shelly - A pure and vanilla shell-like interface for the web.
 * 
 * @author Er Galvão Abbott <galvao@galvao.eti.br>
 * @version 0.1.0-alpha
 * @link https://github.com/galvao-eti/shelly
 */

let responseType = null;

document.addEventListener('DOMContentLoaded', function () {
    let shellyElement = document.createElement('div');
    shellyElement.setAttribute('id', 'shelly');

    document.body.appendChild(shellyElement);

    showMotd();
    newLine();
});

function newLine()
{
    let lineElement = document.createElement('span');
    let promptElement = document.createElement('span');
    let readLineElement = document.createElement('input');
    readLineElement.value = "";

    promptElement.setAttribute('class', 'prompt');
    promptElement.insertAdjacentText(
        'afterBegin',
        CONFIG.user.name + '@' + CONFIG.API.address + CONFIG.user.qualifier + '> '
    );

    readLineElement.setAttribute('class', 'readline');

    lineElement.appendChild(promptElement);
    lineElement.appendChild(readLineElement);

    document.querySelector('#shelly').appendChild(lineElement);
    document.querySelector('#shelly').appendChild(document.createElement('div'));

    let lines = document.querySelectorAll('.readline');
    let currentLine = lines.item(lines.length - 1);

    currentLine.focus();

    currentLine.addEventListener('keydown', async function (e) {
        if (e.code == 'Enter') {
            let data = await process(e.target);
            let dataElement = document.createElement('pre');

            if (CONFIG.debug === true) {
                console.table(data);
            }
            
            if (typeof processResponse === 'function') {
                let processResult = processResponse(data);

                if (processResult instanceof HTMLElement) {
                    dataElement = processResult;   
                }
            } else {
                if (responseType.includes('text/html')) {
                    dataElement = document.createElement('div');
                    dataElement.insertAdjacentHTML('afterBegin', data.response);
                } else {
                    dataElement.insertAdjacentText('afterBegin', data.response);
                }
                
                dataElement.setAttribute('class', 'data');
                lineElement.appendChild(dataElement);
            }

            lineElement.appendChild(dataElement);

            newLine();
        }
    });

    return;
}

async function process(element)
{
    let input = element.value.trim();
    element.setAttribute('disabled', true);

    if (input === '') {
        return input;
    }

    let url = CONFIG.API.proto + CONFIG.API.proto_separator + CONFIG.API.address;
    url += (CONFIG.API.port !== '' ? ':' + CONFIG.API.port : '') + CONFIG.API.url_separator + CONFIG.API.endpoint;

    let request = new Request(url, {
        method: CONFIG.API.method,
        mode: (CONFIG.API.CORS === true ? "cors" : "same-origin"),
        headers: {
            "SHELLY-INPUT": input
        }
    });

    const response = await fetch(request);
    responseType = response.headers.get("content-type");

    let data = null;

    if (responseType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        data = 'Error processing the request.';
    }
    
    return data;
}

function showMotd()
{
    let element = document.createElement('pre');

    element.insertAdjacentText('afterBegin', CONFIG.MOTD);
    element.setAttribute('class', 'prompt');

    document.querySelector('#shelly').appendChild(element);
    
    return;
}