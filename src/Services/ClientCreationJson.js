import Log from "./Log";

let ClientCreationJson = {
  "nome": "",
  "apelido": "",
  "identificacaoFiscal": "",
  "organizationUnitId": 0,
  "email": "",
  "dataNascimento": "",
  "nomeMae": "",
  "nomePai": "",
  "nacionalidade": "",
  "sexo": "",
  "endereco": {
    "rua": "",
    "numero": "",
    "complemento": "",
    "bairro": "",
    "cep": "",
    "cidade": "",
    "uf": ""
  },
  "enderecoCorrespondencia": {
    "rua": "",
    "numero": "",
    "complemento": "",
    "bairro": "",
    "cep": "",
    "cidade": "",
    "uf": ""
  },
  "rg": {
    "numero": "",
    "dataEmissao": "",
    "orgaoEmissor": "",
    "ufOrgaoEmissor": ""
  },
  "telefoneFixo": {
    "ddd": "",
    "numero": ""
  },
  "telefoneMovel": {
    "ddd": "",
    "numero": ""
  },
  "pessoaPoliticamenteExposta": null,
  "rendaMensal": 0
}

function copyParametersIntoClientCreationJson(payload) {
  recursivelyCopyObjectParameters(payload, ClientCreationJson)
}

function recursivelyCopyObjectParameters(src, destination) {
  for (const key in src) {
    if (Object.hasOwnProperty.call(src, key) && Object.hasOwnProperty.call(destination, key)) {
      if (src[key] !== null) {
        destination[key] = src[key];
      }
    }
  }
}

function copyUserCreationParametersIntoClientCreationJson(payload) {
  ClientCreationJson["nome"] = payload["name"];
  ClientCreationJson["apelido"] = payload["name"];
  ClientCreationJson["identificacaoFiscal"] = payload["cpf"];
  ClientCreationJson["email"] = payload["email"];
  ClientCreationJson["organizationUnitId"] = payload["organizationUnitId"];
  ClientCreationJson["telefoneMovel"] = { "ddd": payload["ddd"], "numero": payload["phoneNumber"] };
  Log.verbose("copyUserCreationParametersIntoClientCreationJson " + JSON.stringify(ClientCreationJson));
}

function copyEditedPhoneNumber(payload) {
  ClientCreationJson["telefoneMovel"] = { "ddd": payload["ddd"], "numero": payload["mobileNumber"] };
}

function returnDataForRgFormComponent() {
  let dataTobeSent = {
    "rgNumber": ClientCreationJson.rg.numero,
    "issueBody": ClientCreationJson.rg.orgaoEmissor,
    "issueState": ClientCreationJson.rg.ufOrgaoEmissor,
    "issueDate": ClientCreationJson.rg.dataEmissao.split("T")[0],
    "name": ClientCreationJson.nome,
    "dob": ClientCreationJson.dataNascimento.split("T")[0],
    "fatherName": ClientCreationJson.nomePai,
    "motherName": ClientCreationJson.nomeMae
  }

  return dataTobeSent;
}

export default ClientCreationJson;
export { copyParametersIntoClientCreationJson, copyUserCreationParametersIntoClientCreationJson, returnDataForRgFormComponent, copyEditedPhoneNumber }
