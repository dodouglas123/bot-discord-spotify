const { glob } = require('glob');
const { promisify } = require('util');
const promise = promisify(glob);

module.exports = async(client) => {
    const slahs = await promise(`${process.cwd()}/src/comandos/*/*.js`)
    const array = [];
    slahs.map((x) => {
        const file = require(x);
        if (!file.name) return;
        
        client.slash.set(file.name, file);
        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        array.push(file);
    });
    
    client.on('ready', async() => await client.application.commands.set(array));
    
    const event = await promise(`${process.cwd()}/src/eventos/*.js`);
    event.map((x) => require(x));
}