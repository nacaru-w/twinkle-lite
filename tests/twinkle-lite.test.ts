// Mock the mw object globally
(global as any).mw = {
    Api: class {
        // Mock API methods if needed
    },
    config: {
        get: (key: string) => {
            const mockConfig: { [key: string]: string } = {
                wgPageName: 'Main_Page',
            };
            return mockConfig[key] || '';
        },
    },
};

import { calculateTimeDifferenceBetweenISO, getTalkPage, parseTimestamp, stripTalkPagePrefix, abbreviatedMonths } from "./../src/utils/utils"
import { fetchAppeal, prepareAppealResolutionTemplate, substitutePageContent } from './../src/modules/blockappeals'
import { extractPageTitleFromWikicode, replaceDRTemplate } from './../src/modules/deletionrequestcloser'
import { makeDiffMessage } from './../src/modules/hide'
import { BlockAppealResolution } from "../src/types/twinkle-types";

describe('Util functions', () => {

    test('getTalkPage properly returns talk pages', () => {
        const cases: { input: string, expected: string }[] = [
            { input: 'Plantilla:Infobox', expected: 'Plantilla_discusión:Infobox' },
            { input: 'Anexo:2024_Football_Season', expected: 'Anexo_discusión:2024_Football_Season' },
            { input: 'Wikipedia:Administrators', expected: 'Wikipedia_discusión:Administrators' },
            { input: 'Ayuda:Editing', expected: 'Ayuda_discusión:Editing' },
            { input: 'Wikiproyecto:Mathematics', expected: 'Wikiproyecto_discusión:Mathematics' },
            { input: 'Main_Page', expected: 'Discusión:Main_Page' },
            { input: 'RandomTitle', expected: 'Discusión:RandomTitle' },
            { input: 'Astronomía', expected: 'Discusión:Astronomía' },
            { input: 'Ciencia_de_la_computación', expected: 'Discusión:Ciencia_de_la_computación' },
            { input: '¡Hola_mundo!', expected: 'Discusión:¡Hola_mundo!' },
            { input: 'Tokyo_2020_Olympics', expected: 'Discusión:Tokyo_2020_Olympics' },
            { input: 'Año_Nuevo_Chino_2024', expected: 'Discusión:Año_Nuevo_Chino_2024' },
            { input: 'José_Martí', expected: 'Discusión:José_Martí' },
            { input: 'La_vuelta_a_Colombia', expected: 'Discusión:La_vuelta_a_Colombia' },
            { input: 'Fútbol_Club_Barcelona', expected: 'Discusión:Fútbol_Club_Barcelona' },
            { input: 'Einstein_Theory_of_Relativity', expected: 'Discusión:Einstein_Theory_of_Relativity' },
            { input: '9/11_Attacks', expected: 'Discusión:9/11_Attacks' },
            { input: 'World_War_II', expected: 'Discusión:World_War_II' },
            { input: 'Cómo_aprender_JavaScript', expected: 'Discusión:Cómo_aprender_JavaScript' },
            { input: 'Brexit', expected: 'Discusión:Brexit' },
            { input: 'Mount_Everest', expected: 'Discusión:Mount_Everest' },
            { input: 'Pablo_Neruda', expected: 'Discusión:Pablo_Neruda' },
            { input: 'Réquiem_para_un_Sueño', expected: 'Discusión:Réquiem_para_un_Sueño' },
            { input: 'Artificial_Intelligence_in_Healthcare', expected: 'Discusión:Artificial_Intelligence_in_Healthcare' },
            { input: 'México_Independiente', expected: 'Discusión:México_Independiente' },
            { input: 'Luna_1_misión_espacial', expected: 'Discusión:Luna_1_misión_espacial' },
            { input: 'COVID-19_Pandemic', expected: 'Discusión:COVID-19_Pandemic' },
            { input: 'International_Space_Station', expected: 'Discusión:International_Space_Station' },
            { input: 'Escherichia_coli', expected: 'Discusión:Escherichia_coli' },
            { input: 'Alicia_en_el_país_de_las_maravillas', expected: 'Discusión:Alicia_en_el_país_de_las_maravillas' },
            { input: 'Eiffel_Tower', expected: 'Discusión:Eiffel_Tower' },
            { input: 'Geopolitics_of_Europe', expected: 'Discusión:Geopolitics_of_Europe' },
            { input: 'Guerra_Francisco_de_Miranda', expected: 'Discusión:Guerra_Francisco_de_Miranda' },
            { input: 'Turing_Award', expected: 'Discusión:Turing_Award' },
            { input: 'E=mc^2', expected: 'Discusión:E=mc^2' }
        ];

        cases.forEach(({ input, expected }) => {
            expect(getTalkPage(input)).toBe(expected);
        });
    });

    test('stripTalkPagePrefix removes "Discusión:" prefix', () => {
        const cases: { input: string, expected: string }[] = [
            { input: 'Discusión:Plantilla:Infobox', expected: 'Plantilla:Infobox' },
            { input: 'Discusión:Anexo:2024_Football_Season', expected: 'Anexo:2024_Football_Season' },
            { input: 'Discusión:Wikipedia:Administrators', expected: 'Wikipedia:Administrators' },
            { input: 'Discusión:Ayuda:Editing', expected: 'Ayuda:Editing' },
            { input: 'Discusión:Wikiproyecto:Mathematics', expected: 'Wikiproyecto:Mathematics' },
            { input: 'Discusión:Main_Page', expected: 'Main_Page' },
            { input: 'Discusión:RandomTitle', expected: 'RandomTitle' },
            { input: 'Discusión:Astronomía', expected: 'Astronomía' },
            { input: 'Discusión:¡Hola_mundo!', expected: '¡Hola_mundo!' },
            { input: 'Discusión:COVID-19_Pandemic', expected: 'COVID-19_Pandemic' },
            { input: 'Discusión:Artificial_Intelligence_in_Healthcare', expected: 'Artificial_Intelligence_in_Healthcare' },
            { input: 'NonTalkPage', expected: 'NonTalkPage' }, // Title without "Discusión:" prefix
            { input: 'Main_Page', expected: 'Main_Page' }, // No prefix
            { input: 'RandomTitle', expected: 'RandomTitle' }, // No prefix
            { input: 'E=mc^2', expected: 'E=mc^2' } // No prefix
        ];

        cases.forEach(({ input, expected }) => {
            expect(stripTalkPagePrefix(input)).toBe(expected);
        });
    });

    test('parseTimestamp parses and formats timestamps', () => {
        const cases: { input: string, expected: string }[] = [
            { input: '2024-01-01T00:00:00Z', expected: '1 de enero de 2024' }, // New Year's Day
            { input: '2024-02-29T00:00:00Z', expected: '29 de febrero de 2024' }, // Leap year
            { input: '2020-02-29T00:00:00Z', expected: '29 de febrero de 2020' }, // Leap year (earlier)
            { input: '2024-04-15T14:30:00Z', expected: '15 de abril de 2024' }, // Mid-month date
            { input: '2023-06-15T00:00:00Z', expected: '15 de junio de 2023' }, // Mid-year date
            { input: '2022-08-01T12:00:00Z', expected: '1 de agosto de 2022' }, // Beginning of the month
            { input: '2019-11-11T00:00:00Z', expected: '11 de noviembre de 2019' }, // Significant date
            { input: '2018-10-31T00:00:00Z', expected: '31 de octubre de 2018' }, // Halloween (example)
            { input: '2023-03-01T00:00:00Z', expected: '1 de marzo de 2023' }, // Beginning of March
            { input: '2024-07-04T00:00:00Z', expected: '4 de julio de 2024' }, // Independence Day (US, example)
            { input: '2024-01-15T12:00:00Z', expected: '15 de enero de 2024' }, // Mid month
            { input: '2024-05-20T08:00:00Z', expected: '20 de mayo de 2024' }, // Random date
            { input: '2017-12-25T00:00:00Z', expected: '25 de diciembre de 2017' }, // Christmas (example)
            { input: '2021-07-20T00:00:00Z', expected: '20 de julio de 2021' }, // Random date
            { input: 'invalid-timestamp', expected: 'Invalid Date' }, // Invalid timestamp format
        ];

        cases.forEach(({ input, expected }) => {
            expect(parseTimestamp(input)).toBe(expected);
        });
    });

    test('calculateTimeDifferenceBetweenISO calculates differences in days and hours', () => {
        const cases: { olderISO: string, newerISO: string, expected: { days: number, hours: number } }[] = [
            { olderISO: '2019-05-01T10:00:00Z', newerISO: '2019-05-02T15:00:00Z', expected: { days: 1, hours: 5 } },
            { olderISO: '2023-02-28T23:00:00Z', newerISO: '2023-03-01T01:00:00Z', expected: { days: 0, hours: 2 } },
            { olderISO: '2020-01-01T00:00:00Z', newerISO: '2020-12-31T23:59:59Z', expected: { days: 365, hours: 23 } }, // Adjusted expected value
            { olderISO: '2018-07-15T14:30:00Z', newerISO: '2018-07-16T09:00:00Z', expected: { days: 0, hours: 18 } },
            { olderISO: '2017-11-10T05:45:00Z', newerISO: '2017-11-12T13:20:00Z', expected: { days: 2, hours: 7 } },
            { olderISO: '2000-06-15T00:00:00Z', newerISO: '2024-06-15T00:00:00Z', expected: { days: 8766, hours: 0 } }, // Across 24 years
            { olderISO: '2021-08-10T22:00:00Z', newerISO: '2021-08-11T04:00:00Z', expected: { days: 0, hours: 6 } },
            { olderISO: '2015-12-31T23:59:59Z', newerISO: '2016-01-01T23:59:59Z', expected: { days: 1, hours: 0 } },
            { olderISO: '2023-06-01T08:00:00Z', newerISO: '2023-06-30T20:00:00Z', expected: { days: 29, hours: 12 } },
            { olderISO: '1999-12-31T11:59:59Z', newerISO: '2000-01-01T12:00:00Z', expected: { days: 1, hours: 0 } },
            { olderISO: '2022-10-15T13:45:00Z', newerISO: '2022-10-16T13:45:00Z', expected: { days: 1, hours: 0 } },
            { olderISO: '2024-02-29T23:00:00Z', newerISO: '2024-03-01T01:00:00Z', expected: { days: 0, hours: 2 } }, // Leap day
        ];

        cases.forEach(({ olderISO, newerISO, expected }) => {
            expect(calculateTimeDifferenceBetweenISO(olderISO, newerISO)).toEqual(expected);
        });
    });

})

describe('Block appeals functions', () => {
    test("prepareAppealResolutionTemplate formats the appeal resolution template", () => {
        const cases: { appeal: string; explanation: string; resolution: BlockAppealResolution; expected: string }[] = [
            {
                appeal: "Creo que el bloqueo fue un error.",
                explanation: "El usuario proporcionó pruebas que respaldan su afirmación.",
                resolution: "Aprobación",
                expected: "{{Desbloqueo revisado|Creo que el bloqueo fue un error.|El usuario proporcionó pruebas que respaldan su afirmación. ~~~~|aprobación}}"
            },
            {
                appeal: "No estaba al tanto de la [[Wikipedia:Política|política]].",
                explanation: "El usuario prometió cumplir con las [[Wikipedia:Reglas|reglas]] en el futuro.",
                resolution: "Rechazo",
                expected: "{{Desbloqueo revisado|No estaba al tanto de la [[Wikipedia:Política|política]].|El usuario prometió cumplir con las [[Wikipedia:Reglas|reglas]] en el futuro. ~~~~|rechazo}}"
            },
            {
                appeal: "El bloqueo se debió a un malentendido. Véase [[Usuario:Ejemplo|mi página de usuario]].",
                explanation: "Una discusión adicional aclaró la situación en [[Wikipedia:Café|el Café]].",
                resolution: "Aprobación",
                expected: "{{Desbloqueo revisado|El bloqueo se debió a un malentendido. Véase [[Usuario:Ejemplo|mi página de usuario]].|Una discusión adicional aclaró la situación en [[Wikipedia:Café|el Café]]. ~~~~|aprobación}}"
            },
            {
                appeal: "Por favor, revísenlo en este enlace externo: [https://example.com].",
                explanation: "Más detalles están en [https://example.org mi sitio web personal].",
                resolution: "Rechazo",
                expected: "{{Desbloqueo revisado|Por favor, revísenlo en este enlace externo: [https://example.com].|Más detalles están en [https://example.org mi sitio web personal]. ~~~~|rechazo}}"
            },
            {
                appeal: "[https://example.com/ver más detalles] sobre mi caso en mi blog.",
                explanation: "Discutido con [[Usuario:Admin|un administrador]] previamente.",
                resolution: "Aprobación",
                expected: "{{Desbloqueo revisado|[https://example.com/ver más detalles] sobre mi caso en mi blog.|Discutido con [[Usuario:Admin|un administrador]] previamente. ~~~~|aprobación}}"
            },
            {
                appeal: "",
                explanation: "",
                resolution: "Rechazo",
                expected: "{{Desbloqueo revisado|| ~~~~|rechazo}}"
            },
            {
                appeal: "El bloqueo fue incorrecto. Véase {{diff|12345}}.",
                explanation: "El usuario mostró arrepentimiento y citó {{cita|Quiero contribuir positivamente}}.",
                resolution: "Aprobación",
                expected: "{{Desbloqueo revisado|El bloqueo fue incorrecto. Véase {{diff|12345}}.|El usuario mostró arrepentimiento y citó {{cita|Quiero contribuir positivamente}}. ~~~~|aprobación}}"
            }
        ];

        cases.forEach(({ appeal, explanation, resolution, expected }) => {
            expect(prepareAppealResolutionTemplate(appeal, explanation, resolution)).toBe(expected);
        });
    });

    test("fetchAppeal extracts appeal from standard template", () => {
        const content = `
            Este es un artículo largo sobre la historia de Wikipedia. 
            Se menciona que algunos usuarios consideran que sus bloqueos no son justos.
            {{desbloquear|El bloqueo fue injusto y considero que la situación fue mal interpretada.}}
            Aquí se discuten las políticas generales de bloqueo.
        `;
        const expected = "El bloqueo fue injusto y considero que la situación fue mal interpretada.";
        expect(fetchAppeal(content)).toBe(expected);
    });

    test("fetchAppeal extracts appeal from template with parameter '1='", () => {
        const content = `
            En esta página de discusión, se debate el {{small|bloqueo}} de un usuario.
            {{desbloquear|1=Creo que mi bloqueo no fue apropiado debido a las circunstancias presentadas.}}
            Los administradores revisarán este caso con más detalle.
        `;
        const expected = "Creo que mi bloqueo no fue apropiado debido a las circunstancias presentadas.";
        expect(fetchAppeal(content)).toBe(expected);
    });

    test("fetchAppeal handles appeal with nested templates", () => {
        const content = `
            Página de discusión del usuario bloqueado. Tiene otras {{plantillas|algo}}.
            {{desbloquear|El bloqueo fue incorrecto. Véase {{diff|12345}} para más contexto.}}
            Se espera que los administradores tomen una decisión justa. {{small|Hola}} qué tal.
        `;
        const expected = "El bloqueo fue incorrecto. Véase {{diff|12345}} para más contexto.";
        expect(fetchAppeal(content)).toBe(expected);
    });

    test("fetchAppeal returns null if no desbloquear template is present", () => {
        const content = `
            Este es un comentario general en la página de discusión. 
            No contiene una solicitud de desbloqueo.
        `;
        expect(fetchAppeal(content)).toBeNull();
    });

    test("fetchAppeal returns null if desbloquear template is empty", () => {
        const content = `
            Este usuario ha dejado una solicitud de desbloqueo, pero no ha proporcionado detalles.
            {{desbloquear|}}
            Los administradores esperarán más información antes de proceder.
        `;
        expect(fetchAppeal(content)).toBeNull();
    });

    test("fetchAppeal ignores case in template name", () => {
        const content = `
            Este es un caso especial donde el usuario usó mayúsculas en la plantilla.
            {{DESBLOQUEAR|Por favor, revise mi caso porque no hubo una advertencia previa.}}
            Se ha solicitado una {{small|revisión}}.
        `;
        const expected = "Por favor, revise mi caso porque no hubo una advertencia previa.";
        expect(fetchAppeal(content)).toBe(expected);
    });

    test("fetchAppeal handles whitespace around template", () => {
        const content = `
            Este es un caso con espacios adicionales en la plantilla.
            {{   desbloquear   |   Necesito participar en la discusión para resolver un conflicto.   }}
            Se espera que los administradores consideren la solicitud.
        `;
        const expected = "Necesito participar en la discusión para resolver un conflicto.";
        expect(fetchAppeal(content)).toBe(expected);
    });

    test("substitutePageContent replaces a simple desbloquear template on a Wikipedia talk page", () => {
        const content = `
            == Bloqueo reciente ==
            {{Aviso de bloqueo|usuario=Ejemplo|motivo=Ediciones disruptivas}}
            Hola, este es un mensaje automático para informarte que has sido bloqueado.
    
            {{desbloquear|Considero que mi bloqueo es injusto debido a que fue realizado sin advertencias previas.}}
            Espero que los administradores revisen esta solicitud.
    
            --~~~~
        `;
        const newTemplate = `{{Desbloqueo revisado|Considero que mi bloqueo es injusto debido a que fue realizado sin advertencias previas.|Motivo revisado para el desbloqueo o rechazo|rechazo|{{safesubst:TESParam}}}}`;
        const expected = `
            == Bloqueo reciente ==
            {{Aviso de bloqueo|usuario=Ejemplo|motivo=Ediciones disruptivas}}
            Hola, este es un mensaje automático para informarte que has sido bloqueado.
    
            {{Desbloqueo revisado|Considero que mi bloqueo es injusto debido a que fue realizado sin advertencias previas.|Motivo revisado para el desbloqueo o rechazo|rechazo|{{safesubst:TESParam}}}}
            Espero que los administradores revisen esta solicitud.
    
            --~~~~
        `;
        expect(substitutePageContent(content, newTemplate)).toBe(expected);
    });

    test("substitutePageContent handles nested templates on a Wikipedia talk page", () => {
        const content = `
            == Bloqueo injustificado ==
            Hola, quisiera apelar mi bloqueo. Creo que no fue correcto. 
    
            {{desbloquear|El bloqueo fue incorrecto. Véase {{diff|12345}} para más contexto.}}
            Muchas gracias por su atención.
    
            {{Aviso de discusión archivada}}
        `;
        const newTemplate = `{{Desbloqueo revisado|El bloqueo fue incorrecto. Véase {{diff|12345}} para más contexto.|Motivo revisado para el desbloqueo o rechazo|aprobación|{{safesubst:TESParam}}}}`;
        const expected = `
            == Bloqueo injustificado ==
            Hola, quisiera apelar mi bloqueo. Creo que no fue correcto. 
    
            {{Desbloqueo revisado|El bloqueo fue incorrecto. Véase {{diff|12345}} para más contexto.|Motivo revisado para el desbloqueo o rechazo|aprobación|{{safesubst:TESParam}}}}
            Muchas gracias por su atención.
    
            {{Aviso de discusión archivada}}
        `;
        expect(substitutePageContent(content, newTemplate)).toBe(expected);
    });

    test("substitutePageContent handles '1=' prefix correctly on a Wikipedia talk page", () => {
        const content = `
            == Solicitud de desbloqueo ==
            {{Aviso de solicitud|usuario=Ejemplo|estado=pendiente}}
            Hola, me gustaría que reconsideren mi bloqueo.
    
            {{desbloquear|1=Creo que fue un error bloquearme por una edición no intencional.}}
            Espero una respuesta.
    
            --~~~~
        `;
        const newTemplate = `{{Desbloqueo revisado|Creo que fue un error bloquearme por una edición no intencional.|Motivo revisado para el desbloqueo o rechazo|rechazo|{{safesubst:TESParam}}}}`;
        const expected = `
            == Solicitud de desbloqueo ==
            {{Aviso de solicitud|usuario=Ejemplo|estado=pendiente}}
            Hola, me gustaría que reconsideren mi bloqueo.
    
            {{Desbloqueo revisado|Creo que fue un error bloquearme por una edición no intencional.|Motivo revisado para el desbloqueo o rechazo|rechazo|{{safesubst:TESParam}}}}
            Espero una respuesta.
    
            --~~~~
        `;
        expect(substitutePageContent(content, newTemplate)).toBe(expected);
    });

    test("substitutePageContent replaces only the first desbloquear template if multiple exist on a Wikipedia talk page", () => {
        const content = `
            == Discusión de desbloqueo ==
            Hola, este mensaje es para solicitar el desbloqueo de mi cuenta.
    
            {{desbloquear|Esta es la primera solicitud.}}
            Comentario adicional.
    
            {{desbloquear|Segunda solicitud con otro contexto.}}
            Más detalles aquí.
    
            --~~~~
        `;
        const newTemplate = `{{Desbloqueo revisado|Esta es la primera solicitud.|Motivo revisado para el desbloqueo o rechazo|aprobación|{{safesubst:TESParam}}}}`;
        const expected = `
            == Discusión de desbloqueo ==
            Hola, este mensaje es para solicitar el desbloqueo de mi cuenta.
    
            {{Desbloqueo revisado|Esta es la primera solicitud.|Motivo revisado para el desbloqueo o rechazo|aprobación|{{safesubst:TESParam}}}}
            Comentario adicional.
    
            {{desbloquear|Segunda solicitud con otro contexto.}}
            Más detalles aquí.
    
            --~~~~
        `;
        expect(substitutePageContent(content, newTemplate)).toBe(expected);
    });

    test("substitutePageContent handles complex headers and nested content on a Wikipedia talk page", () => {
        const content = `
            == [[Usuario:Ejemplo|Ejemplo]] ==
            Hola administradores, quisiera solicitar mi desbloqueo.
    
            {{desbloquear|El bloqueo no fue apropiado porque mis ediciones seguían las normas. Véase {{diff|67890}}.}}
            Espero que esto sea considerado.
    
            == Otra sección ==
            Comentarios adicionales aquí.
        `;
        const newTemplate = `{{Desbloqueo revisado|El bloqueo no fue apropiado porque mis ediciones seguían las normas. Véase {{diff|67890}}.|Motivo revisado para el desbloqueo o rechazo|rechazo|{{safesubst:TESParam}}}}`;
        const expected = `
            == [[Usuario:Ejemplo|Ejemplo]] ==
            Hola administradores, quisiera solicitar mi desbloqueo.
    
            {{Desbloqueo revisado|El bloqueo no fue apropiado porque mis ediciones seguían las normas. Véase {{diff|67890}}.|Motivo revisado para el desbloqueo o rechazo|rechazo|{{safesubst:TESParam}}}}
            Espero que esto sea considerado.
    
            == Otra sección ==
            Comentarios adicionales aquí.
        `;
        expect(substitutePageContent(content, newTemplate)).toBe(expected);
    });

})

describe('Deletion request closer functions', () => {

    test("replaceDRTemplate replaces the DR template with replacement text", () => {
        const input = `
    === [[Facultad de Matemáticas (Universidad de La Laguna)]] ===
    {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|O|11|diciembre}}
    
    :{{a|Facultad de Matemáticas (Universidad de La Laguna)}}
    :{{busca fuentes|Facultad de Matemáticas (Universidad de La Laguna)}}
        `;
        const replacement = `{{cierracdb-arr}} '''MANTENER'''. [[Usuario:Crystallizedcarbon|Crystallizedcarbon]] ([[Usuario Discusión:Crystallizedcarbon|discusión]]) 12:34 19 mar 2021 (UTC)`;

        const expectedOutput = `
    === [[Facultad de Matemáticas (Universidad de La Laguna)]] ===
    {{cierracdb-arr}} '''MANTENER'''. [[Usuario:Crystallizedcarbon|Crystallizedcarbon]] ([[Usuario Discusión:Crystallizedcarbon|discusión]]) 12:34 19 mar 2021 (UTC)
    
    :{{a|Facultad de Matemáticas (Universidad de La Laguna)}}
    :{{busca fuentes|Facultad de Matemáticas (Universidad de La Laguna)}}
        `;

        expect(replaceDRTemplate(input, replacement)).toBe(expectedOutput);
    });

    test("replaceDRTemplate returns input unchanged if no DR template is found", () => {
        const input = `
    === [[Facultad de Matemáticas (Universidad de La Laguna)]] ===
    Some content without the DR template.
    
    :{{a|Facultad de Matemáticas (Universidad de La Laguna)}}
    :{{busca fuentes|Facultad de Matemáticas (Universidad de La Laguna)}}
        `;
        const replacement = `{{cierracdb-arr}} '''MANTENER'''. [[Usuario:Crystallizedcarbon|Crystallizedcarbon]] ([[Usuario Discusión:Crystallizedcarbon|discusión]]) 12:34 19 mar 2021 (UTC)`;

        // Input should remain unchanged because the template is not present
        expect(replaceDRTemplate(input, replacement)).toBe(input);
    });

    test("replaceDRTemplate handles edge case with unusual characters in template", () => {
        const input = `
    === [[Facultad de Matemáticas (Universidad de La Laguna)]] ===
    {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|Q|22|febrero}}
    
    More content and other DR templates like {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|X|4|junio}}
    
    :{{a|Facultad de Matemáticas (Universidad de La Laguna)}}
    :{{busca fuentes|Facultad de Matemáticas (Universidad de La Laguna)}}
        `;
        const replacement = `{{cierracdb-arr}} '''MANTENER'''. [[Usuario:Crystallizedcarbon|Crystallizedcarbon]] ([[Usuario Discusión:Crystallizedcarbon|discusión]]) 12:34 19 mar 2021 (UTC)`;

        const expectedOutput = `
    === [[Facultad de Matemáticas (Universidad de La Laguna)]] ===
    {{cierracdb-arr}} '''MANTENER'''. [[Usuario:Crystallizedcarbon|Crystallizedcarbon]] ([[Usuario Discusión:Crystallizedcarbon|discusión]]) 12:34 19 mar 2021 (UTC)
    
    More content and other DR templates like {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|X|4|junio}}
    
    :{{a|Facultad de Matemáticas (Universidad de La Laguna)}}
    :{{busca fuentes|Facultad de Matemáticas (Universidad de La Laguna)}}
        `;

        expect(replaceDRTemplate(input, replacement)).toBe(expectedOutput);
    });

    test("replaceDRTemplate returns the same if input is empty", () => {
        const input = '';
        const replacement = `{{cierracdb-arr}} '''MANTENER'''. [[Usuario:Crystallizedcarbon|Crystallizedcarbon]] ([[Usuario Discusión:Crystallizedcarbon|discusión]]) 12:34 19 mar 2021 (UTC)`;

        expect(replaceDRTemplate(input, replacement)).toBe(input);
    });

    test("extractPageTitleFromWikicode extracts title from page with discussion content", () => {
        const input = `
            === [[Facultad de Matemáticas (Universidad de La Laguna)]] ===
            {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|O|11|diciembre}}
            :{{a|Facultad de Matemáticas (Universidad de La Laguna)}}
            :{{busca fuentes|Facultad de Matemáticas (Universidad de La Laguna)}}
            Tal como en otros casos, no hay información relevante sobre la facultad que no pueda ocupar unas líneas en la página que hay sobre de la universidad...
            [[Usuario:Abajo estaba el pez|Abajo estaba el pez]]
        `;
        const expected = "Facultad de Matemáticas (Universidad de La Laguna)";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

    test("extractPageTitleFromWikicode handles page with discussion and multiple templates", () => {
        const input = `
            === [[Biografía de Albert Einstein]] ===
            {{comentario}} Este artículo es interesante, pero necesita más fuentes para su veracidad.
            :{{busca fuentes|Biografía de Albert Einstein}}
            :{{a|Albert Einstein}}
            Este es un tema fascinante que debe ser tratado de forma rigurosa.
            [[Usuario:EinsteinFan|Fan de Einstein]] 14:22 19 ene 2024 (UTC)
        `;
        const expected = "Biografía de Albert Einstein";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

    test("extractPageTitleFromWikicode extracts title from page with content and timestamp", () => {
        const input = `
            === [[Desarrollo de la Teoría de la Relatividad]] ===
            {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|A|10|noviembre}}
            El concepto de relatividad de Einstein fue revolucionario...
            [[Usuario:PhysicsGuru|Physics Guru]] 09:30 01 dic 2024 (UTC)
        `;
        const expected = "Desarrollo de la Teoría de la Relatividad";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

    test("extractPageTitleFromWikicode extracts title from page with internal links and comments", () => {
        const input = `
            === [[Historia de la Computación]] ===
            {{comentario}} La computación ha evolucionado significativamente desde sus inicios.
            :{{a|Historia de la Computación}}
            :{{busca fuentes|Historia de la Computación}}
            El avance de la tecnología en este campo ha sido vertiginoso...
            [[Usuario:TechHistorian|Tech Historian]] 16:45 05 feb 2024 (UTC)
        `;
        const expected = "Historia de la Computación";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

    test("extractPageTitleFromWikicode handles complex page titles and surrounding content", () => {
        const input = `
            === [[Historia de las Matemáticas en la Antigüedad]] ===
            {{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA|X|12|enero}}
            Este artículo cubre los orígenes de las matemáticas en diferentes civilizaciones antiguas.
            [[Usuario:MathHistorian|Math Historian]] 10:00 22 abr 2024 (UTC)
        `;
        const expected = "Historia de las Matemáticas en la Antigüedad";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

    test("extractPageTitleFromWikicode returns null for text without page title", () => {
        const input = `
            Esto es solo un texto de ejemplo sin ningún enlace a una página.
            Algunas ideas sobre diferentes temas que podrían ser tratados en artículos de Wikipedia...
        `;
        expect(extractPageTitleFromWikicode(input)).toBeNull();
    });

    test("extractPageTitleFromWikicode handles page with mixed content", () => {
        const input = `
            === [[Cultura y Sociedad del Renacimiento]] ===
            El Renacimiento fue una época de gran florecimiento cultural...
            {{comentario}} Este artículo necesita más referencias y contexto histórico.
            [[Usuario:HistoricalExpert|Historical Expert]] 11:05 02 mar 2025 (UTC)
        `;
        const expected = "Cultura y Sociedad del Renacimiento";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

    test("extractPageTitleFromWikicode extracts title from page with multiple sections", () => {
        const input = `
            === [[Evolución de las Especies]] ===
            En este artículo se exploran las diferentes teorías sobre la evolución de las especies.
            :{{busca fuentes|Evolución de las Especies}}
            :{{a|Charles Darwin}}
            [[Usuario:BioHistorian|Bio Historian]] 18:50 23 mar 2024 (UTC)
        `;
        const expected = "Evolución de las Especies";
        expect(extractPageTitleFromWikicode(input)).toBe(expected);
    });

})

describe('Hide functions', () => {
    test("makeDiffMessage formats the diff list into a bullet-pointed message", () => {
        const inputList = ["145743992", "123456789", "987654321"];
        const expected = `
* [[Especial:Diff/145743992]]
* [[Especial:Diff/123456789]]
* [[Especial:Diff/987654321]]
        `.trim();
        expect(makeDiffMessage(inputList)).toBe(expected);
    });

    test("makeDiffMessage handles a list with only one diff ID", () => {
        const inputList = ["145743992"];
        const expected = "* [[Especial:Diff/145743992]]";
        expect(makeDiffMessage(inputList)).toBe(expected);
    });

    test("makeDiffMessage handles an empty list", () => {
        const inputList: string[] = [];
        const expected = "";
        expect(makeDiffMessage(inputList)).toBe(expected);
    });

    test("makeDiffMessage formats the diff list with internal links correctly", () => {
        const inputList = ["987654321", "112233445", "998877665"];
        const expected = `
* [[Especial:Diff/987654321]]
* [[Especial:Diff/112233445]]
* [[Especial:Diff/998877665]]
        `.trim();
        expect(makeDiffMessage(inputList)).toBe(expected);
    });

})