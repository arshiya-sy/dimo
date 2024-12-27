import React from 'react';
import "../styles/main.css";
import PageNames from '../Services/PageNames';
import PageState from '../Services/PageState';
import ColorPicker from "../Services/ColorPicker";
import constantObjects from "../Services/Constants";
import MetricServices from '../Services/MetricsService';
import androidApiCalls from "../Services/androidApiCallsService";
import GeneralUtilities from "../Services/GeneralUtilities";
import PropTypes from "prop-types";

export default class PrivacyPortuguese2024 extends React.Component {

        componentDidMount() {
                const links = [
                        { id: "privacyStatement", url: "https://www.motorola.com/us/legal/product-privacy" },
                        { id: "privacyPolicy", url: "https://en.caf.io/privacy-policy" },
                        { id: "productPrivacy", url: "https://www.motorola.com/us/legal/product-privacy" },
                        { id: "submitsurvey", url: "https://privacyportal.onetrust.com/webform/3c884b5f-db83-4077-91c8-fbfdaaba21fe/892f82cf-3e73-4d45-bccc-4d3b46133414" },
                        { id: "arbiPrivacy", url: "https://dpo.privacytools.com.br/policy-view/dqylOOMaE/1/poli%CC%81tica-de-privacidade/pt_BR?s=1633465937184" }
                    ];
                    links.forEach(link => {
                        const element = document.getElementById(link.id);
                        if (element) {
                            element.onclick = () => androidApiCalls.openUrlInBrowser(link.url);
                        }
                    });
        }

        openEmail = () => {
                androidApiCalls.openEmail();
        }

        openPrevious = () => {
                return this.moveToNextScreen("/privacy2023", false);
        }

        moveToNextScreen = (redirectPathName, storeToHistoryPath = true) => {

                const redirectComponentData = {
                        pathname: redirectPathName,
                        state: {},
                        fromComponent: this.componentName
                };

                return GeneralUtilities.pushHistoryPath(redirectComponentData, this.props?.location, { 'storeToHistoryPath': storeToHistoryPath });
        }

        handleDialer = (phNum) => () => {
                let event = {
                        eventType: constantObjects.customerCare,
                        page_name: PageNames.personalInfo.privacy,
                };
                MetricServices.reportActionMetrics(event, new Date().getTime());
                MetricServices.onPageTransitionStop(PageNames.personalInfo.privacy, PageState.close);
                androidApiCalls.startDialer(phNum);
        }

        render() {
                return (
                        <div>
                                <p dir="ltr"><span className="Caption highEmphasis">Aviso de privacidade do App Dimo</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Em vigor a partir de 15 de Junho de 2024.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Esta Pol&iacute;tica de Privacidade tamb&eacute;m denominada de Aviso de privacidade do App Dimo da Motorola (&quot;Aviso de privacidade&quot;) e descreve: (i) como a Motorola coleta, usa, armazena ou processa os dados pessoais de usu&aacute;rios, indiv&iacute;duos, no contexto do uso do App Dimo (o &quot;App&quot;); e (ii) a rela&ccedil;&atilde;o de compartilhamento de informa&ccedil;&otilde;es entre a Motorola, e outros terceiros, fornecedores, parceiros, envolvidos nas atividades de servi&ccedil;os, produtos e processamento de dados junto ao App Dimo.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Esse Aviso de privacidade, pr&aacute;ticas descritas, &eacute; regido pelas Leis brasileiras, sobretudo, em especial, a Lei n&ordm; 13.709/2018 (&ldquo;LGPD&rdquo;), O tratamento dos dados objeto desse Aviso de privacidade se dar&aacute; no Brasil.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Antes de criar sua conta Dimo no App, voc&ecirc; deve estar ciente de que usar o App envolver&aacute; algumas atividades de processamento dos seus dados pessoais pela Motorola e tamb&eacute;m pelos nossos fparceiros e fornecedores. Neste Aviso de privacidade, os termos &quot;Motorola&quot; ou &quot;n&oacute;s&quot; referem- se ao Lenovo Group Ltd e &agrave;s empresas afiliadas do grupo, inclusive a Motorola. A Motorola processar&aacute; seus dados pessoais na fun&ccedil;&atilde;o de controladora dessas informa&ccedil;&otilde;es.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Este Aviso de privacidade rege a rela&ccedil;&atilde;o entre a Motorola e voc&ecirc;, al&eacute;m das atividades espec&iacute;ficas de processamento de dados pessoais realizadas em fun&ccedil;&atilde;o do App Dimo. Parasaber mais sobre como a Motorola lida com seus dados pessoais, acesse a Declara&ccedil;&atilde;o de privacidade global dos produtos Motorola no endere&ccedil;o&nbsp;</span><span id="productPrivacy" style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>https://www.motorola.com/us/legal/product-privacy</span><span className="Caption highEmphasis">.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Observe que o App &eacute; um servi&ccedil;o oferecido no App &quot;Hello You&quot;, Quando voc&ecirc; cria uma conta do App Dimo da Motorola, se registra automaticamente no App Hello You, al&eacute;m de abrir uma conta junto ao nosso parceiro de neg&oacute;cios, o Banco Arbi S/A.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Quais s&atilde;o os dados pessoais que o App processa?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">A defini&ccedil;&atilde;o de dados pessoais inclui qualquer informa&ccedil;&atilde;o relacionada a uma pessoa natural identificada ou identific&aacute;vel.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Quando voc&ecirc; instala e usa o App, a Motorola exige alguns dos seus dados pessoais necess&aacute;rios para o funcionamento adequado do App. O uso do App gera dados de diferentes categorias, que se resumem a:</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">a) informa&ccedil;&otilde;es da conta na Motorola e de seu contato, como nome, n&uacute;mero de telefone, endere&ccedil;o de e-mail e credenciais da conta;&nbsp;</span></p>
                                <p dir="ltr"><span className="Caption highEmphasis">b) dados de identifica&ccedil;&atilde;o, como seu CEP, CPF ou uma imagem do seu rosto para validar a conta;&nbsp;</span></p>
                                <p dir="ltr"><span className="Caption highEmphasis">c) informa&ccedil;&otilde;es relacionadas a transa&ccedil;&otilde;es, como o valor total de opera&ccedil;&otilde;es realizadas por usu&aacute;rio a cada dia/semana/m&ecirc;s entre voc&ecirc; e outras pessoas, empresas e/ou &oacute;rg&atilde;os do governo, al&eacute;m do tamanho da sua conta. Contudo, n&atilde;o coletamos nem armazenamos seus n&uacute;meros de cart&atilde;o de cr&eacute;dito nem de conta banc&aacute;ria;&nbsp;</span></p>
                                <p dir="ltr"><span className="Caption highEmphasis">d) dados do dispositivo, como o n&uacute;mero IMEI, dados de uso do App Dimo, localiza&ccedil;&atilde;o e determinados par&acirc;metros necess&aacute;rios para a aplicação de medidas de segurança e a realiza&ccedil;&atilde;o de transa&ccedil;&otilde;es operacionais e an&aacute;lises agregadas.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Tamb&eacute;m processamos dados de localiza&ccedil;&atilde;o e outros identificadores, como o endere&ccedil;o IP. Al&eacute;m disso, se voc&ecirc; quiser realizar transa&ccedil;&otilde;es com outras pessoas, processaremos informa&ccedil;&otilde;es dos seus contatos do telefone para fazer transfer&ecirc;ncias a eles, por exemplo. O App Dimo precisa coletar essas informa&ccedil;&otilde;es para voc&ecirc; criar a conta digital Dimo no App e interagir com sua conta do Banco Arbi S/A.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Em virtude da rela&ccedil;&atilde;o de parceria da Motorola com o parceiro Banco Arbi S/A algumas das informa&ccedil;&otilde;es coletadas de voc&ecirc;, usu&aacute;rio, s&atilde;o compartilhadas com o Banco Arbi S/A e forncedores para consecu&ccedil;&atilde;o dos servi&ccedil;os e produtos financeiros e para fins do cumprimento das obriga&ccedil;&otilde;es legais e normativas do Banco Arbi S/A, como a preven&ccedil;&atilde;o de fraudes, por exemplo. Para tanto, temos a obriga&ccedil;&atilde;o de identificar e monitorar as transa&ccedil;&otilde;es que tamb&eacute;m envolvem agentes politicos (as chamadas pessoas expostas politicamente), al&eacute;m de registrar toda e qualquer transa&ccedil;&atilde;o em moeda brasileira ou estrangeira, t&iacute;tulos, valores mobili&aacute;rios, metais ou qualquer outro ativo que possa ser convertido em dinheiro. O Banco Arbi conta com fornecedores tais como a CAF e incorpora os servi&ccedil;os dela de verifica&ccedil;&atilde;o de identidade e preven&ccedil;&atilde;o de fraudes no processo de cria&ccedil;&atilde;o de contas. O App Dimo incorpora um kit de desenvolvimento de software (SDK) da CAF que transmite suas informa&ccedil;&otilde;es pessoais, incluindo imagens do seu documento de identidade oficial, diretamente para a CAF em nome do Banco Arbi.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Algumas das informa&ccedil;&otilde;es e dados citados acima, processadas, j&aacute; est&atilde;o &agrave; nossa disposi&ccedil;&atilde;o, e as usaremos para facilitar a integra&ccedil;&atilde;o.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">As bases legais para o processamento de dados pessoais podem variar. Por isso, pediremos o seu consentimento o qual &eacute; dado e formalizado eletronicamente por voc&ecirc; quando isso for estritamente necess&aacute;rio de acordo com a legisla&ccedil;&atilde;o aplic&aacute;vel de prote&ccedil;&atilde;o de dados. No entanto, algumas informa&ccedil;&otilde;es relacionadas &agrave; sua identidade e &agrave; conta do Banco Arbi S/A podem ser exigidas por lei. Tamb&eacute;m podemos processar suas informa&ccedil;&otilde;es e dados pessoais por demandas contratuais, visto que voc&ecirc; firma um contrato com a Motorola e o Banco Arbi S/A e aceita nossos termos e condi&ccedil;&otilde;es para o servi&ccedil;o contratado, incluindo o tratamento de seus dados pessoais, o que configura um contrato. Portanto, temos a obriga&ccedil;&atilde;o contratual de prestar servi&ccedil;os que exigem o processamento de dados pessoais. Nesse escopo, podemos nos basear em um interesse leg&iacute;timo em rela&ccedil;&atilde;o a determinadas atividades de processamento de dados, o que ser&aacute; objeto de determinados tipos de comunica&ccedil;&otilde;es.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Quais s&atilde;o as permiss&otilde;es espec&iacute;ficas que voc&ecirc; nos concede, e como pode retirar seu consentimento?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Quando voc&ecirc; configura o App Dimo, este exige as permiss&otilde;es abaixo.</span></p>
                                <p></p>
                                <div style={{textAlign: "center"}} dir="ltr">
                                        <table style={{ border: "none" }}>
                                                <tbody>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', backgroundColor: ColorPicker.darkMediumEmphasis, padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Recurso</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', backgroundColor: ColorPicker.darkMediumEmphasis, padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Dados processados</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', backgroundColor: ColorPicker.darkMediumEmphasis, padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Finalidade</span></p>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Localiza&ccedil;&atilde;o</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Localiza&ccedil;&atilde;o espec&iacute;fica conforme as permiss&otilde;es do App</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Obter informa&ccedil;&otilde;es de Wi-Fi e conectar o App ao roteador Wi-Fi do dispositivo.&nbsp;</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Wi-Fi</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Configura&ccedil;&otilde;es de Wi-Fi conforme as permiss&otilde;es do App</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Transferir dados e interagir com o dispositivo e com a nuvem.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>C&acirc;mera</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Acesso &agrave; c&acirc;mera e &agrave; galeria do telefone conforme as permiss&otilde;es do App</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Carregar a foto do seu avatar. Para compartilhar o dispositivo usando a leitura de c&oacute;digo QR, a c&acirc;mera precisa estar ativada.&nbsp;</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Dados m&oacute;veis</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Configura&ccedil;&otilde;es de dados m&oacute;veis conforme as permiss&otilde;es do App</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Presumimos o uso de dados m&oacute;veis.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Microfone</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Grava&ccedil;&otilde;es de voz</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Ser&aacute; necess&aacute;rio em vers&otilde;es futuras do aplicativo para incluir comandos de voz.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Grava&ccedil;&atilde;o de&aacute;udio</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Grava&ccedil;&otilde;es de &aacute;udio</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Permiss&atilde;o exigida pelo SDK da CAF como parte dos servi&ccedil;os de preven&ccedil;&atilde;o de fraudes.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Informa&ccedil;&otilde;es do pacote</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Permiss&atilde;o de acesso do aplicativo &agrave; c&acirc;mera</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Para validar a vers&atilde;o do aplicativo  em uso.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                </tbody>
                                        </table>
                                </div>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Voc&ecirc; pode mudar a permiss&atilde;o quando quiser nas configura&ccedil;&otilde;es do sistema ou do App Dimo no telefone. Alguns recursos n&atilde;o estar&atilde;o dispon&iacute;veis se voc&ecirc; n&atilde;o conceder permiss&atilde;o ao App Dimo.&nbsp;</span></p>
                                <p></p>
                                <p dir='ltr'><span className="Caption highEmphasis">N&atilde;o venderemos seus dados para fins de marketing.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Como entraremos em contato com voc&ecirc;?</span></p >
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Entraremos em contato com voc&ecirc; em algumas situa&ccedil;&otilde;es. Por exemplo, avisaremos sobre mudan&ccedil;as importantes relacionadas &agrave; sua conta, como quando o cart&atilde;o ou a conta forem bloqueados ou houver altera&ccedil;&otilde;es no seu PIN, senha ou perfil. Tamb&eacute;m mandaremos notifica&ccedil;&otilde;es relevantes sobre novos recursos e dicas de como usar o App Dimo. Al&eacute;m disso, podemos enviar lembretes sobre a&ccedil;&otilde;es pendentes, como se voc&ecirc; come&ccedil;ar a criar sua conta e n&atilde;o terminar, por exemplo.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">S&oacute; enviaremos mensagens de marketing por e-mail ou por notifica&ccedil;&otilde;es push no App se voc&ecirc; concordar com isso primeiro.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Compartilhamos seus dados pessoais com terceiros?</span></p >
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Para oferecer o servi&ccedil;o, compartilharemos suas informa&ccedil;&otilde;es com o Banco Arbi S/A. com a finalidade de propiciar o uso dos produtos e servi&ccedil;os financeiros junto ao App Dimo. O Banco Arbi, por sua vez, tamb&eacute;m pode as compartilhar com os provedores de servi&ccedil;o dele, incluindo a CAF e a intermediadora tecnológica Jazz  Tecnologia e Soluções em Meios de Pagamento Ltda., inscrita no CNPJ/MF sob o nº 35.496.855/0001-30. Também compartilhamos seus dados pessoais com alguns fornecedores que nos auxiliam na prestação do serviço. Isso inclui serviços de pagamento, armazenamento em nuvem e atendimento ao cliente. Como parte do acordo de processamento de dados da Motorola com eles, exigimos que todos os terceiros obedeçam a práticas recomendadas de segurança da informação, tomem todas as medidas adequadas para proteger seus dados e os processem apenas quando isso for necessário para manter o funcionamento adequado do App Dimo e prestar nossos serviços quando você precisar.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Jamais venderemos seus dados pessoais.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Por quanto tempo guardamos seus dados pessoais?</span></p >
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Quando criamos um produto, nossa meta &eacute; proporcionar a melhor experi&ecirc;ncia poss&iacute;vel aos usu&aacute;rios. Por isso, processamos dados pessoais para as finalidades descritas neste Aviso de privacidade, mas s&oacute; armazenamos suas informa&ccedil;&otilde;es pessoais pelo tempo necess&aacute;rio para o funcionamento adequado do produto. Em alguns casos, podemos reter seus dados pessoais conforme requisitos legais. Por exemplo, de acordo com a Lei 9.613/1998, precisamos manter registros de identifica&ccedil;&atilde;o dos nossos clientes (como CPF e comprovante de endere&ccedil;o) por um per&iacute;odo m&iacute;nimo de 5 (cinco) anos.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">O App Dimo refor&ccedil;a que poder&aacute; manter alguns dados e/ou continuar a realizar o tratamento de dados, mesmo no caso de solicita&ccedil;&atilde;o de elimina&ccedil;&atilde;o, oposi&ccedil;&atilde;o, bloqueio ou anonimiza&ccedil;&atilde;o, em algumas circunst&acirc;ncias, como para cumprimento de obriga&ccedil;&otilde;es legais, contratuais e regulat&oacute;rias, para resguardar e exercer direitos do App Dimo, dos usu&aacute;rios, para preven&ccedil;&atilde;o de atos il&iacute;citos e em processos judiciais, administrativos e arbitrais, inclusive por questionamento de terceiros sobre suas atividades e em outras hip&oacute;teses previstas em lei.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Seus dados pessoais s&atilde;o protegidos pelos padr&otilde;es mais avan&ccedil;ados de seguran&ccedil;a. Quais s&atilde;o seus direitos de prote&ccedil;&atilde;o de dados?</span></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Se voc&ecirc; quiser exercer seu direito de exclus&atilde;o de dados ou acesso a informa&ccedil;&otilde;es, entre outros, envie um e-mail para </span><span onClick={this.openEmail} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>backoffice@contadigitalmotorola.com.br&nbsp;</span><span className="Caption highEmphasis"> ou entre em contato como Suporte do App Dimo pela Central de Atendimento Conta Digital Motorola:</span><span onClick={this.handleDialer("40201741")} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>4020-1741 </span>
                                        <span className="Caption highEmphasis">(capitais e regi&otilde;es metropolitanas) e </span><span onClick={this.handleDialer("08000258858")} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>0800-0258858</span><span className="Caption highEmphasis"> (demais localidades). Acesse a&nbsp;</span><span id="privacyStatement" style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Declara&ccedil;&atilde;o de privacidade global dos produtos Motorola</span><span className="Caption highEmphasis">&nbsp;para saber mais sobre seus direitos e outras informa&ccedil;&otilde;es.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Altera&ccedil;&otilde;es neste Aviso de privacidade</span></p >
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Nossa miss&atilde;o &eacute; manter a maior transpar&ecirc;ncia poss&iacute;vel.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Podemos atualizar este Aviso de privacidade para avisar sobre mudan&ccedil;as na forma como o produto ou a Motorola processa seus dados pessoais e perguntar se voc&ecirc; aceita essas altera&ccedil;&otilde;es nos casos em que isso &eacute; exigido por lei. Quando isso acontecer, avisaremos voc&ecirc; por notifica&ccedil;&atilde;o push no app ou por e-mail.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Fale conosco</span></p >
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Para obter informa&ccedil;&otilde;es gerais sobre quest&otilde;es relacionadas &agrave; privacidade na Motorola,&nbsp;</span><span id="submitsurvey" style={{ fontSize: '12px', color: '#4282c1', backgroundColor: '#ffffff', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>envie uma solicita&ccedil;&atilde;o de privacidade</span><span className="Caption highEmphasis">&nbsp;e selecione Apresentar reclama&ccedil;&atilde;o</span><span className="Caption highEmphasis">&nbsp;na nossa plataforma de privacidade. Se voc&ecirc; quiser enviar uma solicita&ccedil;&atilde;o de privacidade, como para exclus&atilde;o de dados ou acesso a informa&ccedil;&otilde;es, entre em contato com o Suporte do App Dimo pelo e-mail&nbsp;</span><span onClick={this.openEmail} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>backoffice@contadigitalmotorola.com.br</span><span className="Caption highEmphasis">. Responderemos assim que possivel.&nbsp;</span></p>
                                <p></p>
                                <p dir='ltr'><span className="Caption highEmphasis">O Banco Arbi tem um Encarregado (Data Protection Officer - DPO) que est&aacute; &agrave; disposi&ccedil;&atilde;o nos seguintes endere&ccedil;os de contato:</span></p>
                                <p></p>
                                <p dir='ltr'><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>ENCARREGADO (DPO):&nbsp;</span><span className="Caption highEmphasis">Elaine Masello de Araujo</span><br></br>
                                        <span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Endere&ccedil;o para correspond&ecirc;ncias:&nbsp;</span><span className="Caption highEmphasis">Av. Niemeyer, n&ordm; 02, t&eacute;rreo &ndash; parte, Leblon, Rio de Janeiro &ndash; RJ, CEP: 22.450-220</span><br></br>
                                        <span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>E-mail para contato:&nbsp;</span><span id="arbiPrivacy" style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>dpo_privacidade@bancoarbi.com.br</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Consulte as vers&otilde;es anteriores deste aviso </span><span onClick={this.openPrevious} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>aqui.&nbsp;</span></p>

                        </div>
                );
        }
}
PrivacyPortuguese2024.propTypes = {
        location: PropTypes.object
};