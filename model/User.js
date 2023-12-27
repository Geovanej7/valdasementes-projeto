
const Sequelize = require('sequelize')
const sequelize = new Sequelize("valda_sementes","root", "CreateBancoGeo1",{
host:'localhost',
dialect:'mysql'
})

sequelize.authenticate().then(function(){
    console.log("Conectado!!")
    }).catch(function(erro){
    console.log("Erro ao conectar: "+erro)
    })

const User = sequelize.define('usuario',{

    login: {
    type: Sequelize.STRING
    },
    nome: {
    type: Sequelize.STRING
    },
    senha: {
    type: Sequelize.STRING
    }
    })
    
    module.exports = User