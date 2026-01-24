const logType = {
    0: {type:  '[DEBUG]', level: 0}
    ,1: {type: '[INFO]',  level: 1}
    ,2: {type: '[ERROR]', level: 2}
}

function getTimestamp() 
{
    const now = new Date();
    return now.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function debug(...args) 
{
    logOutput(0, args)
}

export function info(...args) 
{
    logOutput(1, args)
}

export function error(...args) 
{
    logOutput(2, args)
}

export function debugTable(args) 
{
    logOutput(0)
    tableOutput(0, args)
}

export function infoTable(args) 
{
    logOutput(1)
    tableOutput(1, args)
}

export function errorTable(args) 
{
    logOutput(2)
    tableOutput(2, args)
}

function tableOutput(currentLevel, tableData)
{

    if(isOutputAllow(currentLevel))
    {
        console.table(tableData);
    }
}

function logOutput(currentLevel, ...args)
{
    if(isOutputAllow(currentLevel))
    {
        console.log(getTimestamp(), logType[currentLevel].type, ...args);
    }
}

function isOutputAllow(currentLevel)
{
    const tmpLogType = logType[currentLevel] 

    if(tmpLogType === undefined)
    {
        return false
    }
    else if(currentLevel >= tmpLogType.level)
    {
        return true
    }
    else
    {
        return false
    }
}