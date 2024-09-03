"use strict";

/**
 * shelly - A pure and vanilla shell-like interface for the web.
 * 
 * @author Er Galvão Abbott <galvao@galvao.eti.br>
 * @version 0.1.0-alpha
 * @link https://github.com/galvao-eti/shelly
 */

document.addEventListener('DOMContentLoaded', async function () {
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

            let dataElement = document.createElement('div');

            dataElement.setAttribute('class', 'data');
            dataElement.insertAdjacentText('afterBegin', data);
            
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

    console.log(request);

    const response = await fetch(request);
    const data = await response.text();

    if (response.status != 200) {
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