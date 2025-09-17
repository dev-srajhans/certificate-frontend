import { Document, Paragraph, TextRun, AlignmentType } from "docx";
const HEADING_SIZE = 20;
const TEXT_SIZE = 16;
export const duyamPramanpatra = (certificateData: any) => {

  const pramanpatradharakMember = certificateData.familymembers.find((member: { pramanpatradharak: any; }) => member.pramanpatradharak);


  const doc = new Document({
    sections: [
      {
        children: [
          // Government Order Header
          new Paragraph({
            children: [
              new TextRun({
                text: "(शासन निर्णय, सामान्य प्रशासन विभाग क्रमांक एईएम-1080:35/16-अ,दि.21 जानेवारी 1980 चे सहपत्र) ",
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          // Certificate Title
          new Paragraph({
            children: [
              new TextRun({
                text: "प्रकल्पग्रस्त व्यक्तीला अथवा प्रकल्पग्रस्त व्यक्तीच्या कुंटुंबातील तिच्यावर अवलंबुन असणा-या व्यक्तीच्या नोकरीविषयी सवलतीच्या संदर्भात दाखला",
                bold: true,
                size: HEADING_SIZE,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("\n"),

          // Reference Number & Date
          new Paragraph({
            children: [
              new TextRun({ text: "दुय्यम प्रत.", size: HEADING_SIZE }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "क्रमांक :", size: HEADING_SIZE }),
              new TextRun({ text: ` ${certificateData.pramanpatra_number || "---"} / ${certificateData.prakalpa_nav || "---"} / ${certificateData.issue_dt ? new Date(certificateData.issue_dt).getFullYear() : "---"}`, bold: true, size: HEADING_SIZE }),
            ],
            alignment: AlignmentType.RIGHT,
          }),

          // District Office & Date
          new Paragraph({
            children: [
              new TextRun({ text: "जिल्हाधिकारी कार्यालय, (पुनर्वसन) अमरावती", bold: true, size: HEADING_SIZE }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `दिनांक :${certificateData.issue_dt
                  ? new Date(certificateData.issue_dt).toLocaleDateString('en-GB')
                  : "---"}`, size: HEADING_SIZE
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph("\n"),

          new Paragraph({
            children: [
              new TextRun({ text: "मूळ प्रमाणपत्र हरविल्यामुळे प्रमाणपत्राची", size: TEXT_SIZE }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `दुय्य्म प्रत दि.${new Date().toLocaleDateString('en-GB') || "---"} ला देण्यात आली.`, size: TEXT_SIZE
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),

          // District Office & Date
          new Paragraph({
            children: [
              new TextRun({ text: "उपजिल्हाधिकारी (पुनर्वसन)", bold: true, size: HEADING_SIZE }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "जिल्हाधिकारी कार्यालय, अमरावती", bold: true, size: HEADING_SIZE }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph("\n"),


          // Certificate Content
          new Paragraph({
            children: [
              new TextRun({
                text: `1. दाखला देण्यात येतो कि, `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.prakalp_grast_nav || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `रा. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.grast_gav || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `ता. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.grast_taluka || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `जि. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.grast_jilha || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `यांचे मौजा `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.shet_jamin_gav || "________"}`,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `ता. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.shet_jamin_taluka || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `जि. `,
                size: TEXT_SIZE,
              }),

              new TextRun({
                text: `${certificateData.shet_jamin_jilha || "________"}`,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `येथिल शेत सर्व्हे क्रमांक / गट क्रमांक ${certificateData.shet_jamin_serve_gut || "_______"} मधील क्षेत्र ${certificateData.shet_jamin_shetra || "_______"}  हे. आर शेत जमीन बुडीत क्षेत्राकरिता शासनाने संपादन केलेली असल्यामुळे ते प्रकल्पग्रस्त व्यक्ती आहे/आहेत.`,
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph("\n"),
          new Paragraph({
            children: [
              new TextRun({
                text: `2. दाखला देण्यात येतो कि, `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.prakalp_grast_nav || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `रा. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.grast_gav || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `ता. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.grast_taluka || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `जि. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.grast_jilha || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),


              new TextRun({
                text: `यांचे मौजा `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.budit_malmata_gav || "________"}`,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `ता. `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${certificateData.budit_malmata_taluka || "________"} `,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `जि. `,
                size: TEXT_SIZE,
              }),

              new TextRun({
                text: `${certificateData.budit_malmata_jilha || "________"}`,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `येथिल घर क्रमांक ${certificateData.budit_malmata_ghar_number || "_______"} मधील क्षेत्र ${certificateData.budit_malmata_shetra || "_______"}  चौ. मी प्रकल्पाचे बुडीत क्षेत्राकरिता घेतलेली असल्यामुळे ते प्रकल्पग्रस्त व्यक्ती आहे/आहेत. आणि/अथवा`,
                size: TEXT_SIZE,
              }),


              new TextRun({
                text: `3. दाखला देण्यात येतो कि,`,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${pramanpatradharakMember.name || "________"}`,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: `(हे उपरोक्त परिच्छेद 2) मधील प्रकल्पग्रस्त व्यक्तीच्या कुटुंबातील आणि तिच्यावर अवलंबुन असणारी व्यक्ती असुन त्याचे प्रकल्पग्रस्त व्यक्तीशी नाते `,
                size: TEXT_SIZE,
              }),
              new TextRun({
                text: `${pramanpatradharakMember.relation || "________"}`,
                size: TEXT_SIZE,
                bold: true,
              }),
              new TextRun({
                text: ` असे आहे.`,
                size: TEXT_SIZE,
              }),

            ],
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph("\n"),

          new Paragraph({
            children: [
              new TextRun({
                text: `4. शासनाच्या पुनर्वसन योजनेअंतर्गत सदर प्रकल्पग्रस्त व्यक्तीला किंवा तिच्या कुटुंबातील आणि तिच्यावर अवलंबुन असणा-या उपरोक्त एकाच व्यक्तीला नोकरी मिळणा-या संदर्भात सदर दाखला परिणामकारक राहिल. वरील प्रमाणे संबंधित व्यक्तीला नोकरी मिळाल्यावर या दाखल्याचे परिणामकारकता रद्द होईल.`,
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph("\n"),
          new Paragraph({
            children: [
              new TextRun({
                text: `5. हया दाखल्याच्या आधारे प्रकल्पग्रस्त व्यक्ती किंवा तिच्यावर अवलंबुन असणा-या एका व्यक्तीला नोकरी देण्याची कार्यवाही करणा-या कार्यालयाने नोकरी दिल्याबाबत तपशिल खालील जिल्हाधिका-याकडे / पुनर्वसन अधिका-याकडे तात्काळ कळविणे आवश्यक आहे. `,
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph("\n"),
          // Signature Section
          new Paragraph({
            children: [
              new TextRun({
                text: `---स्वाक्षरी---`,
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `उपजिल्हाधिकारी (पुनर्वसन)`,
                bold: true,
                size: HEADING_SIZE,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `जिल्हाधिकारी कार्यालय, अमरावती`,
                bold: true,
                size: HEADING_SIZE,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),

          new Paragraph("\n"),
          new Paragraph({
            children: [
              new TextRun({
                text: `टिप 1) वरील  दाखल्याच्या  परिच्छेद 1 व 2 मध्ये  नमुद केलेल्या  किंवा / आणि घरांबाबत भुसंपादन कायदयाच्या कलम -4 अनुसार काढण्यात आलेली अधिसुचना महाराष्ट्र शासनाच्या राजपत्रात ज्या तारखेस  प्रसिद्ध केली जाईल. त्या तारखेपासुन  सदर दाखला परिणामकारक होईल. `,
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `2)  सदर प्रमाणपत्रासोबत अर्जदाराने  प्रकरणात  पुरविलेली  आवश्यक  माहिती  खोटी  निघाल्यास दाखला पुर्वलक्षी  प्रभावाने रद्द होईल. `,
                size: TEXT_SIZE,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
          }),


        ],
      },
    ],
  });
  return doc;
}