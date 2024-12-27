import React from 'react';
import "../styles/main.css";
import PageNames from '../Services/PageNames';
import PageState from '../Services/PageState';
import ColorPicker from "../Services/ColorPicker";
import constantObjects from "../Services/Constants";
import MetricServices from '../Services/MetricsService';
import androidApiCalls from "../Services/androidApiCallsService";


export default class PrivacyEnglish extends React.Component {
        constructor(props) {
                super(props);
        }

        componentDidMount() {
                document.getElementById("privacyStatement").onclick = () => androidApiCalls.openUrlInBrowser("https://www.motorola.com/us/legal/product-privacy");
                document.getElementById("submitsurvey").onclick = () => androidApiCalls.openUrlInBrowser("https://privacyportal.onetrust.com/webform/3c884b5f-db83-4077-91c8-fbfdaaba21fe/892f82cf-3e73-4d45-bccc-4d3b46133414");
                document.getElementById("productPrivacy").onclick = () => androidApiCalls.openUrlInBrowser("https://www.motorola.com/us/legal/product-privacy");
                document.getElementById("arbiPrivacy").onclick=()=>androidApiCalls.openUrlInBrowser("https://dpo.privacytools.com.br/policy-view/dqylOOMaE/1/poli%CC%81tica-de-privacidade/pt_BR?s=1633465937184");
        }

        openEmail= () => {
                androidApiCalls.openEmail()
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
                                <p dir="ltr"><span className="Caption highEmphasis">Effective date March 30, 2022</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">The Dimo App Privacy Notice (&quot;Privacy Notice&quot;) describes: (i) how Motorola collects, uses, stores or otherwise processes an individual’s personal data in the context of Dimo App (the &quot;App&quot;); (ii) the data sharing relationship between Motorola, Banco Arbi and other third parties involved in the data processing activities.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Before you proceed with the creation of your Dimo digital account on the App, we want you to know that using the App involves certain processing activities of your personal data by Motorola and our partners. In this Privacy Notice, the terms &quot;Motorola&quot;, &quot;we&quot; or “us” refers to Lenovo Group Ltd and its affiliated group companies, which include Motorola. Motorola will process your personal data as a data controller of your personal information. &nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">This Privacy Notice governs the relationship between you and Motorola, and the specific personal data processing activities conducted in connection with the Dimo App. To learn more about how Lenovo handles your personal data, please visit &nbsp;</span><span id="privacyStatement" style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Motorola Global Product Privacy Statement</span><span className="Caption highEmphasis">.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Please note that the App is a service offered within the Hello You App and when you create your Dimo App account, you will be automatically registered in the Hello You App. When you create an account in the Dimo App, you will also open an account with our Business Partner, Banco Arbi. </span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">What personal data does the App process?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Personal data means any information which is related to an identified or identifiable natural person.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">When you choose to install and use the App, Motorola requires you to provide personal data that is necessary for the App to function properly. There are different categories of data generated when you use the App, which can be summarized into: </span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">a) Account and Contact Information such as your name, telephone number, email address and account credentials; <br />b) Identity related data such as your CEP, CPF number or an image of your face to validate your account; <br /> c) Transaction related information such us the total value of transactions done by user per day per week/month between you and other people, companies and/or Government agencies or your account size. However, we will not collect or store Credit Card or Bank Account number; <br />d) Device Data such as your IMEI number, App usage data, location and certain parameters that are necessary to allow operational transactions to take place, as well as for aggregated analytics.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">We will also process Location Data and other identifiers such as IP address. In addition, if you want to transact with other people, we will process your phone contact information so you can, for example, transfer money to them. The App needs to collect such information in order to enable you to create the Dimo digital account in the App and interact with your Banco Arbi account.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Some of the information is requested by Banco Arbi for legal purposes, such as fraud prevention. For instance, we are obliged to identify and pay special attention to transactions carried out with political agents (the so-called politically exposed people) and registration of any and all transactions in Brazilian or foreign currency, bonds, securities, metals or any other asset that can be converted into cash.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Finally, we want to inform you that some of the information that will be processed is already available to us and we will use it to support the onboarding process.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Please note that the legal basis for processing personal data may vary. In this sense, we will ask you for consent when this is strictly required by applicable data protection laws. However, information related to your identity and Banco Arbi Account may be legally required. We may also process information under contractual needs, since you are entering into an agreement when accepting the terms and conditions and entering into a contract with Motorola and Banco Arbi, thus we have a contractual obligation to deliver to you our services, for which the processing of personal data is required. We may rely on a legitimate interest basis in relation to certain data processing activities such as certain types of communications.</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">What specific permissions do you grant us, and how to withdraw consent?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">As you set up Dimo, the App will require the following permissions.</span></p>
                                <p></p>
                                <div style={{textAlign: "center"}} dir="ltr">
                                        <table style={{ border: 'none', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', backgroundColor: ColorPicker.darkMediumEmphasis, padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr"><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Feature</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', backgroundColor: ColorPicker.darkMediumEmphasis, padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr"><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Data Processed</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', backgroundColor: ColorPicker.darkMediumEmphasis, padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr"><span style={{ fontSize: '12px', color: '#ffffff', backgroundColor: 'transparent', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Purpose</span></p>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>GPS</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Specific location as per app permissions.</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>To obtain Wi-Fi information and connect the App to the device&rsquo;s own AP hotspot.&nbsp;</span></p>
                                                                                </li>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Motorola will access your location for enhanced security, marketing and potentially other activities if you expressly consent to it.&nbsp;</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Wi-Fi</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Wi-Fi settings as per app permissions.</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>To transfer data and interact with the device and cloud.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Camera&nbsp;</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Access to your camera and phone gallery as per app permissions.</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>To upload your avatar picture. You will be prompted with a pop-up window and be asked to confirm.&nbsp;</span></p>
                                                                                </li>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>If you share the device by scanning the QR code, the camera needs to be turned on.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Cellular</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Cellular settings as per app permission settings</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>We assume mobile data usage</span></p>
                                                                                </li>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>To transfer data and interact with the device and cloud</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Microphone</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Voice recordings</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>This is needed in future version of the app when are planning to introduce voice based commands&nbsp;</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                        <tr style={{ height: '14.4pt' }}>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Package information</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Access permission from Camera app to Dimo and vice versa</span></p>
                                                                </td>
                                                                <td style={{ borderLeft: 'solid #bfbfbf 0.5pt', borderRight: 'solid #bfbfbf 0.5pt', borderBottom: 'solid #bfbfbf 0.5pt', borderTop: 'solid #bfbfbf 0.5pt', verticalAlign: 'top', padding: '0pt 5.4pt 0pt 5.4pt', overflow: 'hidden', overflowWrap: 'break-word' }}>
                                                                        <ul style={{ marginTop: 0, marginBottom: 0, paddingInlineStart: '48px' }}>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>To validate the version of the App used</span></p>
                                                                                </li>
                                                                                <li aria-level={1} dir="ltr" style={{ listStyleType: 'disc', fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre', marginLeft: '-18pt' }}>
                                                                                        <p dir="ltr" style={{ lineHeight: '1.2', marginTop: '0pt', marginBottom: '0pt' }}><span style={{ fontSize: '12px', color: ColorPicker.darkMediumEmphasis, backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>To check if certain flags are enabled for the package eg. We need to enable an App Dimo flag in the package structure for the Camera to access this parameter.</span></p>
                                                                                </li>
                                                                        </ul>
                                                                </td>
                                                        </tr>
                                                </tbody>
                                        </table>
                                </div>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">You can always change the permission from your System/App settings in your phone. Please note that some features would not be available if you do not grant the App permission. Also, we want you to know that we will not sell your data for marketing related purposes.&nbsp;</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">How will we communicate with you?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">We will send you communications in certain situations. For instance, we may reach out to you to let you know about important changes related to your account, such when your Account/Card has been blocked or when your Password/PIN or Profile has been modified. We will also send you important notifications about new features and tips on how to use the App. We may also send you reminders about incomplete actions such as when you started creating the account but did not finish the process.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Finally, we will never send you marketing communications via email or push notification in the App unless you have agreed to marketing communications first.</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Do we share your personal data with third parties?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">In order to provide the service, we will share your information with Banco Arbi. We will also share your personal data with a number of suppliers that support us in providing the services. This includes cloud storage, customer care and payment related services. As part of Motorola data processor arrangement with them, we require that all third parties maintain information security best practices, make all reasonable efforts to secure your data and only process your data for the purposes strictly related to what is required for the App to function properly and our services to be delivered to you when you need it.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Please rest assured that we will never sell your personal data.</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">How long do we keep your personal data?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">When we design a product, we focus on delivering the best user experience. In order to do so, we will process personal data for the purposes described in this Privacy Notice, but we will only retain your personal information as long as necessary to achieve proper performance of the product. In some cases, we may need to retain your personal data when it is required by law, for instance Pursuant to Law 9,613/1998, we need to maintain our client’s identification records (such as CPF and proof of address) for a minimum retention period of 5 years.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Your personal data will be protected with state-of-the-art security standards.</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">What are your data protection rights?</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">If you want to exercise your right to data deletion or data access amongst others, please let us know via email &nbsp;</span><span onClick={this.openEmail} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>atendimento@dimomotorola.com.br</span><span className="Caption highEmphasis"> or reach out to the Dimo App Support Center at Whatsapp +55 11 5198 0000 or at the Central de Atendimento Dimo: </span><span onClick={this.handleDialer("40201741")} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>4020-1741</span>
                                             <span className="Caption highEmphasis"> (Capitais e Regiões Metropolitanas) e </span><span onClick={this.handleDialer("08000258858")} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>0800-0258858</span><span className="Caption highEmphasis"> (Demais localidades). Please visit the </span><span id="productPrivacy" style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Motorola Global Product Privacy Statement</span><span className="Caption highEmphasis"> to learn about your rights and more.&nbsp;</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Changes to this Privacy Notice</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">Our mission is to maintain the greatest possible transparency.</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">We might update this privacy notice to let you know about any changes in the way the product, or Motorola processes your personal data and ask you if you are happy with those changes when necessary by law. We will let you know via in-app push notification or email about such changes to make sure you are up to date.</span></p>
                                <p><br /></p>
                                <p dir="ltr"><span className="CaptionBold highEmphasis">Contact us</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">For general information about privacy issues at Motorola, please </span><span id="submitsurvey" style={{ fontSize: '12px', color: '#4282c1', backgroundColor: '#ffffff', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>submit a privacy request</span><span className="Caption highEmphasis"> and select &quot;apresentar reclamação&quot; on our dedicated platform. If you would like to submit a privacy request, such as for data deletion or access to information, please contact the Dimo App Support Center at &nbsp;</span><span onClick={this.openEmail} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>atendimento@dimomotorola.com.br</span><span className="Caption highEmphasis">.&nbsp;We will contact you as soon as possible.&nbsp;</span></p>
                                <p></p>
                                <p dir="ltr"><span className="Caption highEmphasis">If your question is about Banco Arbi’s privacy practices, please visit &nbsp;</span><span id="arbiPrivacy" style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>Banco Arbi&rsquo;s Privacy Notice</span><span className="Caption highEmphasis">&nbsp;or contact Arbi Bank&rsquo;s Data Protection Officer at &nbsp;</span><span onClick={this.openEmail} style={{ fontSize: '12px', color: '#1155cc', backgroundColor: 'transparent', fontWeight: 500, fontStyle: 'normal', fontVariant: 'normal', textDecoration: 'underline', WebkitTextDecorationSkip: 'none', textDecorationSkipInk: 'none', verticalAlign: 'baseline', whiteSpace: 'pre-wrap' }}>dpo_privacidade@bancoarbi.com.br</span><span className="Caption highEmphasis">.</span></p>
                        </div >
                );
        }
}