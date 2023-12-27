const express = require('express')
const app = express()
app.use(express.static('public'))
const port = 3000
const bodyParser = require("body-parser")
var urlencodedParser = bodyParser.urlencoded({extended:
false})
app.set('view engine', 'ejs');
app.set('views', './views');
const { Op } = require("sequelize")
const Produto = require('./model/produto')
const User = require('./model/User')
//Produto.sync()
//User.sync()

const uuid = require('uuid');
const session = require('express-session')
app.use(session(({
secret: '2C44-1T58-WFpQ350',resave: true,
saveUninitialized: true,
cookie: {
maxAge: 3600000 * 2
}
})));
const bcrypt = require('bcrypt');


//rotas de produto

app.get('/', (req, res) => {
    res.render('home',{ nomeUsuario: req.session.name });
});

app.get('/insereProdutos', (req, res) => {
    
    if(!req.session.userid){
        res.status(401).send("para ter essa permissão, faça o login!");
        }else{
        res.render('cadastraProdutos');
        }
});

app.post('/addProdutos', urlencodedParser, (req, res) => {

    var codigo = req.body.codigo
    var nome = req.body.nome
    var preco = req.body.preco
    

    Produto.create({
        codigo: codigo,
        nome: nome,
        preco: preco
    }).then(function () {
        res.redirect("/")
    }).catch(function (erro) {
        res.send("Erro ao inserir produto: " + erro)
    })
})

app.get('/buscaProduto', (req, res) => {
    if(!req.session.userid){
        res.status(401).send("para ter essa permissão, faça o login!");
        }else{
        res.render('buscarProduto',{nome:req.session.name});
        }
});

app.post('/produtos', urlencodedParser, (req, res) => {

    // Guardando os valores na variável
    var nome = req.body.nome;
    var preco = req.body.preco;
    var codigo = req.body.codigo;

    // Fazendo busca no banco de dados, TODOS OS DADOS
    var todosProdutos = `
        <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Alterar</th>
                <th>Excluir</th>
            </tr>`;

    var nomeFiltro = `%${nome}%`;

    Produto.findAll({
        where: {
            nome: { [Op.like]: nomeFiltro }
        }
    }).then((produtos) => {

        for (var i = 0; i < produtos.length; i++) {
            todosProdutos += `
                <tr>
                    <td>${produtos[i].id}</td>
                    <td>${produtos[i].codigo}</td>
                    <td>${produtos[i].nome}</td>
                    <td>${produtos[i].preco}</td>
                    <td><a href="/alteraProduto?id=${produtos[i].id}">Editar</a></td>
                    <td><a href="/deletaProduto?id=${produtos[i].id}">Excluir</a></td>
                </tr>`;
        }

        todosProdutos += '</table>';
        todosProdutos += `
        <br>
        <button onclick="window.location.href='/'">Voltar</button>
    `;

        res.send(`
            <html>
                <head>
                    <style>
                        body{
                            background-color: #e0fbac;
                        }
                        h2{
                            text-align: center;
                        }
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }

                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }

                        th {
                            background-color: #d3d3d3;
                        }
                        td{
                            background-color: #ffffff;
                        }

                        a {
                            text-decoration: none;
                            color: #333;
                        }
                    </style>
                </head>
                <body>
                    <h2>Produtos</h2>
                    ${todosProdutos}
                </body>
            </html>
        `);

    }).catch((erro) => {
        res.send('Erro: ' + erro);
    });
});

app.get('/alteraProduto', (req, res) => {

    var idProduto = req.query.id

    Produto.findOne({
        where: {
            id: idProduto
        }

    }).then((produtos) => {

        var formulario = 
        `<form action="/updateProduto" method="post">
            <input type='hidden' name='idUp' value='${produtos.id}'><br>
            Código:<input type='text' name='codigoUp' id='codigo' value='${produtos.codigo}'> <br>
            Nome do Produto: <input type='text' name='nomeUp' id='nome' value='${produtos.nome}'> <br>
            Preço: <input type='text' name='precoUp' id='preco' value='${produtos.preco}'> <br>
            <input type='submit' value='Cadastrar'>
        </form>`

        res.send(formulario)
    }).catch((erro) => {
        res.send('Erro: ' + erro)
    })
})

app.post('/updateProduto', urlencodedParser, (req, res) => {

    let idUp = req.body.idUp
    let codigoUp = req.body.codigoUp
    let nomeUp = req.body.nomeUp
    let precoUp = req.body.precoUp
    

    Produto.update({
        codigo: codigoUp,
        nome: nomeUp,
        preco: precoUp 

    } , {
        where: {
            id: idUp
        }
    }).then((produto) => {
        res.send('Produto alterado com sucesso!')
    }).catch((erro) => {
        res.send('Erro: ' + erro)
    })
})

app.get('/deletaProduto', (req, res) => {
    var idProduto = req.query.id;

    // Exibe um alerta no navegador solicitando confirmação
    res.send(
        `<script>
            if (confirm("Tem certeza que deseja excluir o produto?")) {
                // Se o usuário confirmar, redireciona para a rota de exclusão
                window.location.href = "/deletaProdutoConfirmado?id=${idProduto}";
            } else {
                // Se o usuário cancelar, redireciona para a página inicial ou outra rota desejada
                window.location.href = "/";
            }
        </script>`
    );
});

app.get('/deletaProdutoConfirmado', (req,res)=>{
    var idProduto = req.query.id

    Produto.destroy({

        where: {
            id: idProduto
        }
    }).then(()=>{
        res.send("Item excluido com sucesso!")
    }).catch((erro)=>{
        res.send("erro:" + erro)
    })

})

app.get('/todosProdutos', (req, res) => {

    // Fazendo busca no banco de dados, TODOS OS DADOS
    var todosProdutos = `
        <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nome</th>
                <th>Preço</th>
                
            </tr>`;

    Produto.findAll().then((produtos) => {

        for (var i = 0; i < produtos.length; i++) {
            todosProdutos += `
                <tr>
                    <td>${produtos[i].id}</td>
                    <td>${produtos[i].codigo}</td>
                    <td>${produtos[i].nome}</td>
                    <td>${produtos[i].preco}</td>
                </tr>`;
        }

        todosProdutos += '</table>';
        todosProdutos += `
            <br>
            <button onclick="window.location.href='/'">Voltar</button>
        `;

        res.send(`
            <html>
                <head>
                    <style>
                        body {
                            background-color: #e0fbac;
                        }
                        h2 {
                            text-align: center;
                        }
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #d3d3d3;
                        }
                        td {
                            background-color: #ffffff;
                        }
                        a {
                            text-decoration: none;
                            color: #333;
                        }
                    </style>
                </head>
                <body>
                    <h2>Produtos</h2>
                    ${todosProdutos}
                </body>
            </html>
        `);

    }).catch((erro) => {
        res.send('Erro: ' + erro);
    });
});

//rotas de usuario


app.get('/cadastroUser', (req, res) => {
    
    res.render('cadastroUser');
});

app.post('/addUsuario', urlencodedParser, (req, res) => {
    var loginUser = req.body.login;
    var nomeUser = req.body.nome;
    var senhaUser = req.body.senha;
    const saltRounds = 10;

    
    bcrypt.hash(senhaUser, saltRounds, function (err, hash) {
        if (err) {
            console.error('Erro ao gerar o hash da senha:', err);
            res.send("Erro ao cadastrar usuário");
            return;
        }

        
        User.create({
            login: loginUser,
            nome: nomeUser,
            senha: hash, 
        })
            .then(function () {
                res.send("Usuário cadastrado com sucesso!");
            })
            .catch(function (erro) {
                res.send("Erro ao cadastrar usuário: " + erro);
            });
    });
});

app.get('/buscaUser', (req, res) => {
    if(!req.session.userid){
        res.status(401).send("para ter essa permissão, faça o login!");
        }else{
        res.render('buscarUser');
        }
});

app.post('/usuarios', urlencodedParser, (req, res) => {

    // Guardando os valores na variável
    var nome = req.body.nome;
   

    // Fazendo busca no banco de dados, TODOS OS DADOS
    var todosUsuarios = `
        <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Login</th>
                <th>Alterar</th>
                <th>Excluir</th>
            </tr>`;

    var nomeFiltro = `%${nome}%`;

    User.findAll({
        where: {
            nome: { [Op.like]: nomeFiltro }
        }
    }).then((usuarios) => {

        for (var i = 0; i < usuarios.length; i++) {
            todosUsuarios += `
                <tr>
                    <td>${usuarios[i].id}</td>
                    <td>${usuarios[i].nome}</td>
                    <td>${usuarios[i].login}</td>
                    <td><a href="/alteraUser?id=${usuarios[i].id}">Alterar</a></td>
                    <td><a href="/deletaUser?id=${usuarios[i].id}">Excluir</a></td>
                </tr>`;
        }

        todosUsuarios += '</table>';
        todosUsuarios += `
        <br>
        <button onclick="window.location.href='/'">Voltar</button>
    `;

        res.send(`
            <html>
                <head>
                    <style>
                        body{
                            background-color: #e0fbac;
                        }
                        h2{
                            text-align: center;
                        }
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }

                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }

                        th {
                            background-color: #d3d3d3;
                        }
                        td{
                            background-color: #ffffff;
                        }

                        a {
                            text-decoration: none;
                            color: #333;
                        }
                    </style>
                </head>
                <body>
                    <h2>Usuários</h2>
                    ${todosUsuarios}
                </body>
            </html>
        `);

    }).catch((erro) => {
        res.send('Erro: ' + erro);
    });
});

app.get('/alteraUser', (req, res) => {

    var idUser = req.query.id

    User.findOne({
        where: {
            id: idUser
        }

    }).then((usuarios) => {

        var formulario = 
        `<form action="/updateUser" method="post">
            <input type='hidden' name='idUp' value='${usuarios.id}'><br>
            Login:<input type='text' name='loginUp' id='login' value='${usuarios.login}'> <br>
            Nome: <input type='text' name='nomeUp' id='nome' value='${usuarios.nome}'> <br>
            <input type='submit' value='Cadastrar'>
        </form>`

        res.send(formulario)
    }).catch((erro) => {
        res.send('Erro: ' + erro)
    })
})
  
app.post('/updateUser', urlencodedParser, (req, res) => {

    let idUp = req.body.idUp
    let loginUp = req.body.loginUp
    let nomeUp = req.body.nomeUp
    
    

    User.update({
        login: loginUp,
        nome: nomeUp
    } , {
        where: {
            id: idUp
        }
    }).then((produto) => {
        res.send('Produto alterado com sucesso!')
    }).catch((erro) => {
        res.send('Erro: ' + erro)
    })
})

app.get('/deletaUser', (req, res) => {
    var idUser = req.query.id;

    // Exibe um alerta no navegador solicitando confirmação
    res.send(
        `<script>
            if (confirm("Tem certeza que deseja excluir o usuario?")) {
                // Se o usuário confirmar, redireciona para a rota de exclusão
                window.location.href = "/deletaUserConfirmado?id=${idUser}";
            } else {
                // Se o usuário cancelar, redireciona para a página inicial ou outra rota desejada
                window.location.href = "/";
            }
        </script>`
    );
});

app.get('/deletaUserConfirmado', (req,res)=>{
    var idUser = req.query.id

    User.destroy({

        where: {
            id: idUser
        }
    }).then(()=>{
        res.send("Usuário excluido com sucesso!")
    }).catch((erro)=>{
        res.send("erro:" + erro)
    })

})

//lotas de login

app.get('/loginUser', (req, res) => {
    res.render('pageLogin');
});

app.post('/sigin', urlencodedParser, async(req, res) => {
    var loginUser = req.body.login;
    var senha = req.body.senha;
    User.findOne({
    attributes:['id','login','senha','nome'],
    where:{
    login:loginUser
    }
    }).then(async function(User){
    if(User!= null){
    const senha_valida = await 
    bcrypt.compare(senha,User.senha)
    if(senha_valida){
    req.session.userid = User.id;
    req.session.name = User.nome;
    req.session.login = User.login;
    res.redirect("/");
    }else{
    res.send("Senha não corresponde!")
    }
    }else{
    res.send("Usuário não encontrado!")
    }
    }).catch(function(erro){
    res.send("Erro ao realizar login: "+erro)
    }) });

    

app.listen(port, () => {
    console.log("Esta aplicação está escutando a porta" + port)
   })