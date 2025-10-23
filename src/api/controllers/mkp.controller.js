// /controllers/whatsappController.js

const axios = require('axios');

const mkpcontroller = async (req, res) => {
    console.log('=============================================');
    console.log('[MKPController] ⚡ Petición RECIBIDA para MKP');
    var data= req.body.query;
    var sender =data.sender ;
    var message =data.message ;
    console.log('Sender:', sender);
    console.log('Message:', message);
    


};

module.exports = {
  mkpcontroller,
};  