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

const Produto = sequelize.define('produto',{
codigo: {
type: Sequelize.INTEGER
},
nome: {
type: Sequelize.STRING
},
preco: {
type: Sequelize.DOUBLE
}
})

module.exports = Produto 

