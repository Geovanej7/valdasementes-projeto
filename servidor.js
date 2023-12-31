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
//Produto.sync()


//rotas

app.get('/', (req, res) => {
    res.render('home');
});




app.get('/insereProdutos', (req, res) => {
    res.render('cadastraProdutos');
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
        res.send("Produto inserido com sucesso!")
    }).catch(function (erro) {
        res.send("Erro ao inserir produto: " + erro)
    })
})

app.get('/buscaProduto', (req, res) => {
    res.render('buscarProduto');
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
                    <td><a href="/alteraProduto?id=${produtos[i].id}"><img src="fotos/editar.png" alt="Alterar"></a></td>
                    <td><a href="/deletaProduto?id=${produtos[i].id}"><img src="fotos/excluir.png" alt="Excluir"></a></td>
                </tr>`;
        }

        todosProdutos += '</table>';

        res.send(`
            <html>
                <head>
                    <style>
                        body{
                            background-color: lightgreen;
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
                            background-color: #f2f2f2;
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

app.listen(port, () => {
    console.log("Esta aplicação está escutando a porta" + port)
   })