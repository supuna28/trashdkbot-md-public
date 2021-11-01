/*
BASE FEITA POR 遁𝚃 𝚁 𝙰 𝚂 𝙷 ᵈᵏ
CONTATO: https://wa.me/558494740630
NAO RETIRE OS CREDITOS E NENHUM ARQUIVO COM O NOME DO CRIADOR
ESTA BASE POSSUI A LICENÇA MIT, RETIRAR CREDITOS CAUSARÁ PROCESSO!
*/
const {
    MessageType,
    WAMessage,
    ReconnectMode,
    WAProto,
    MediaType
} = require('./custom_modules/@adiwajshing/baileys-md')
var pino = require("pino");
var baileys = require("./custom_modules/@adiwajshing/baileys-md");
var fs = require('fs')
const chalk = require('chalk')

var AuthenticationState = require("./custom_modules/@adiwajshing/baileys-md/lib/Types/Auth");
var initInMemoryKeyStore = require("./custom_modules/@adiwajshing/baileys-md/lib/Utils/validate-connection");
var DisconnectReason = require("./custom_modules/@adiwajshing/baileys-md/lib/Types/index");
(async()=>{
    var trash = undefined;
    var loadState = () => {
    var state = undefined;
    try {
        var sessão = JSON.parse(fs.readFileSync('./sessao.json', { encoding: 'utf-8' }), baileys.BufferJSON.reviver);
        state = {
            creds: sessão.creds,
            keys: baileys.initInMemoryKeyStore(sessão.keys)
        };
    }
    catch (error) { }
            return state;
        };

    // salvar os dados da sessão
    var saveState = (state) => {
        console.log('Salvando Chaves de acesso')
        state = state || trash.authState
        fs.writeFileSync(
            './sessao.json', 
            JSON.stringify(state, baileys.BufferJSON.replacer, 2)
        )
    }

    var startSock = () => {
        const trash = baileys["default"]({
            printQRInTerminal: true,
            logger: pino({ level: 'warn' }),
            auth: loadState()
        })

    trash.ev.on('messages.upsert', m => {
         //Multi Prefixo///
         var prefixo = [
         ".",
         "!",
         "=",
         "&"
         ]
         const msg = m.messages[0]
         //^Corpo completo da mensagem//
        const type = Object.keys(msg.message)[0]
        //^Tipo da mensagem dada por seu corpo//
        const from = msg.key.remoteJid
        //^Destino de onde veio aquela mensagem//
        const content = JSON.stringify(msg.message)
        //^mensagem completa//
        const author = msg.pushName
        //^Nome da pessoa que enviou a mensagem//
     
      //Mapeamento de mensagens recebidas, puxando sempre o conteudo como descrissões de video imagens ou documentos//
        var body = (type === 'conversation') ? msg.message.conversation : (type == 'imageMessage') ?
        msg.message.imageMessage.caption : (type == 'videoMessage') ?
        msg.message.videoMessage.caption : (type == 'extendedTextMessage') ?
        msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ?
        msg.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ?
        msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
      //^Mapeamento de mensagens recebidas, puxando sempre o conteudo como descrissões de video imagens ou documentos//
     
      //identificadores de tipos de mensagens marcadas//
      const isQuotedText = type == 'conversation' || type == 'extendedTextMessage'
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
      const isQuotedButton = type === 'buttonsResponseMessage' && content.includes('buttonsMessage')
      const isQuoted = isQuotedImage || isQuotedVideo || isQuotedAudio || isQuotedSticker
      //^identificadores de tipos de mensagens marcadas//


      /*****Explicações a baixo de cada declaração*****/

      const reply = (texto) => {
          trash.sendMessage(from, {text: texto})
        }
      //^Função pra Mensagem rapida//

      const isComando = prefixo.includes(body !== "" && body.slice(0, 1)) && body.slice(1) !== ''
      //^Identificar quando a mensagem é um comando utilizando o prefixo como  inicio obrigatorio//

      const comando = isComando ? body.slice(1).trim().split(' ')[0].toLowerCase() : ''
      //^Após detectar que é um comando, armazena qual comando foi requisitado//

      const argumentos = body.trim().split(/ +/).slice(1)
      //^Pega cada palavra de uma frase e separa em argumentos separados em um objeto//

      const isGrupo = from.endsWith("@g.us")
      //^Detecta quando é um grupo, devido ao final de seu destino: @g.us//

      if (isComando) {console.log("Comando detectado: " + comando)}
      if (!isComando) {console.log(chalk.red("Mensagem recebida de: ") + chalk.green(from) + chalk.red(" Mensagem: ") + chalk.green(body) + chalk.red(" Nome: ") + chalk.green(author))}
      //^Logs no terminal ao receber uma mensagem

      if(!msg.key.fromMe && m.type === 'notify') { 
      //^As cases no switch só são ativadas quando é um comando e quando a case(caso), é igual ao comando dado na mensagem//
    
      switch(comando) {
        case "texto":
           trash.sendMessage(from, {text: 'Assim se envia um texto!'})
           break
        case 'imagem':
         /*
         * trash.sendMessage(from, {image: Buffer})
         */
        break
       }
      }
    })
    return trash
    }
    
    trash = startSock()
    trash.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            console.log(lastDisconnect.error.output)
            if(lastDisconnect.error.output.statusCode == 410){
                console.log('Reiniciando')
                trash = startSock()
            }
        }
        console.log('Atualização de conexão', update)
    })
    trash.ev.on('auth-state.update', () => saveState())
    //^Salvamento altomatico dos dados da sessão, não toque aqui//
})()
/*
BASE FEITA POR 遁𝚃 𝚁 𝙰 𝚂 𝙷 ᵈᵏ
CONTATO: https://wa.me/558494740630
NAO RETIRE OS CREDITOS E NENHUM ARQUIVO COM O NOME DO CRIADOR
ESTA BASE POSSUI A LICENÇA MIT, RETIRAR CREDITOS CAUSARÁ PROCESSO!
*/
