import Express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// server
const app = Express()
app.set('port', 4000);
app.listen(app.get('port'));
console.log('Servidor corriendo en el puerto', app.get('port'))


//Rutas

app.get('/', (req,res) => res.sendFile(__dirname + '/pages/login.html'))