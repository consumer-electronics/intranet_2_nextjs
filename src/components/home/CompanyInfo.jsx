'use client';

import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Tab,
    Tabs,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';

import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';

const tabsConfig = [
    { label: 'Planeación estratégica', Icon: InsightsOutlinedIcon },
    { label: 'Quiénes somos', Icon: InfoOutlinedIcon },
    { label: 'Reseña histórica', Icon: HistoryOutlinedIcon },
    { label: 'Equipo de trabajo', Icon: GroupsOutlinedIcon },
    { label: 'Nuestra cultura', Icon: EmojiObjectsOutlinedIcon },
    { label: 'Política SIG', Icon: PolicyOutlinedIcon },
];

function TabPanel({ children, value, index, title, Icon }) {
    if (value !== index) {
        return null;
    }

    return (
        <Box role="tabpanel">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        flexShrink: 0,
                    }}
                >
                    <Icon fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                    {title}
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {children}
        </Box>
    );
}

// Marco reutilizable para presentar imágenes institucionales de forma contenida y responsive
function ImageFrame({ children, maxWidth, sx }) {
    return (
        <Box
            sx={{
                width: '100%',
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'center',
                ...(maxWidth && { maxWidth, mx: 'auto' }),
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

const objectives = [
    'Desarrollar integralmente el recurso humano con base en procesos de mejoramiento continuo que garanticen el crecimiento del negocio, la satisfacción de los clientes y el bienestar de sus colaboradores.',
    'Implementar procesos efectivos e innovadores que garanticen la competitividad del negocio.',
    'Estructurar ofertas de valor efectivas para el mercado que fortalezcan la preferencia de la empresa en los clientes.',
    'Fortalecer la orientación al servicio como factor diferenciador de nuestros equipos de trabajo frente a la competencia.',
    'Alcanzar niveles de rentabilidad que garanticen la sostenibilidad y el desarrollo continuo del negocio.',
    'Implementar un sistema de gestión integrado, que consolide un modelo de cultura por procesos, contribuya a la preservación del medio ambiente mediante la prevención de los impactos ambientales que se generen, fortalezca las condiciones de trabajo y el comportamiento para mejorar la salud y seguridad de los colaboradores, y establezca acciones para la prevención de actividades ilícitas en la cadena de suministro.',
];

const regions = [
    'Eje-cafetero y Antioquia',
    'Centro-Oriente',
    'Pacífico',
    'Llanos',
    'Caribe',
    'Centro-sur Amazonia',
];

export default function CompanyInfo() {
    const [tab, setTab] = useState(0);

    const handleChange = (_, newValue) => {
        setTab(newValue);
    };

    return (
        <Card
            sx={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
        >
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    px: { xs: 1, md: 2 },
                }}
            >
                <Tabs
                    value={tab}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        minHeight: 52,
                        '& .MuiTab-root': {
                            minHeight: 52,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                        },
                    }}
                >
                    {tabsConfig.map((t) => (
                        <Tab key={t.label} icon={<t.Icon fontSize="small" />} iconPosition="start" label={t.label} />
                    ))}
                </Tabs>
            </Box>

            <CardContent
                sx={{
                    px: { xs: 2, md: 4 },
                    py: { xs: 3, md: 4 },
                    '& .MuiTypography-body1': { lineHeight: 1.75 },
                }}
            >
                {/* PLANEACIÓN ESTRATÉGICA — contenido sin cambios */}
                <TabPanel value={tab} index={0} title={tabsConfig[0].label} Icon={tabsConfig[0].Icon}>
                    <Typography sx={{ mb: 2 }}>
                        <strong>CONSUMER ELECTRONICS GROUP S.A.S</strong>, tiene como
                        objeto social la importación, exportación, producción y
                        distribución de productos electrónicos y electrodomésticos para
                        el hogar, la industria, y otros sectores.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Con el fin de cumplir con este objeto social, maneja dos unidades
                        de negocio: línea marrón, para televisores, equipos y aparatos de
                        audio y sonido; y la línea blanca, para equipos de aire
                        acondicionado, congeladores, neveras, lavadoras.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        La importación, producción, y distribución de estos
                        electrodomésticos y productos electrónicos, se desarrolla bajo la
                        autorización como únicos distribuidores para Colombia y
                        Latinoamérica de la marca HYUNDAI, y la licencia para ensamblaje
                        de televisores de Hyundai Corporation.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Para el desarrollo efectivo de tan importante tarea, se tiene una
                        planta de producción y centro de distribución ubicada en el
                        corregimiento de Cerritos, a dos (2) km de la ciudad de Pereira,
                        ubicación estratégica como corredor logístico para el centro,
                        sur y noroccidente de Colombia.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Actualmente se abastece el mercado en Colombia a sus canales
                        retail, tradicional y mayorista, con una cobertura que abarca las
                        regiones del Eje Cafetero, Antioquia, el Centro y Oriente del
                        país, Pacífico, Llanos Orientales, Caribe, el Sur y la Amazonia.
                    </Typography>

                    <Typography sx={{ mb: 0 }}>
                        Como factor diferenciador, se tiene un servicio especializado de
                        postventa, con un excelente soporte técnico en todas las regiones
                        a donde llegan los productos para la atención adecuada y oportuna
                        de garantías, y una línea de atención establecida para responder
                        a las necesidades de los clientes.
                    </Typography>
                </TabPanel>

                {/* QUIÉNES SOMOS — contenido sin cambios */}
                <TabPanel value={tab} index={1} title={tabsConfig[1].label} Icon={tabsConfig[1].Icon}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Misión
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        <strong>CONSUMER ELECTRONICS GROUP S.A.S</strong> es una empresa
                        dedicada a la producción y comercialización de artículos
                        electrónicos y electrodomésticos para el hogar, la industria y
                        otros sectores, con un firme compromiso hacia la innovación
                        tecnológica, la calidad y el servicio al cliente; estamos
                        ubicados en el Eje Cafetero, ubicación privilegiada como corredor
                        logístico del centro, norte y suroccidente de Colombia.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Promovemos relaciones de confianza, la mejora continua de los
                        procesos y el compromiso de nuestros colaboradores para la
                        satisfacción de nuestros clientes, generando rentabilidad para el
                        bienestar de todos nuestros grupos de interés, y en permanente
                        armonía con el medio ambiente.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Visión
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        <strong>CONSUMER ELECTRONICS GROUP S.A.S</strong> será una empresa
                        certificada y con reconocimiento de marca, que vive su cultura
                        organizacional, enfocada permanentemente en la gestión, desarrollo
                        e innovación de sus procesos, el bienestar de sus colaboradores, y
                        apasionados por la satisfacción de nuestros clientes.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Tendremos mayor cobertura y penetración con soluciones integrales
                        en productos y servicios para Colombia y mercados
                        latinoamericanos, asegurando un crecimiento sostenible, generando
                        rentabilidad en armonía con el medio ambiente, con el compromiso
                        de operar de manera ética, promoviendo prácticas seguras en todos
                        nuestros procesos, fortaleciendo así la confianza y satisfacción
                        de nuestros clientes y grupos de interés.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Objetivos estratégicos
                    </Typography>

                    <List component="ol" sx={{ listStyleType: 'decimal', pl: 4 }}>
                        {objectives.map((objective, index) => (
                            <ListItem
                                key={index}
                                component="li"
                                sx={{ display: 'list-item', pl: 1, py: 0.5 }}
                            >
                                <ListItemText primary={objective} />
                            </ListItem>
                        ))}
                    </List>
                </TabPanel>

                {/* RESEÑA HISTÓRICA — contenido sin cambios */}
                <TabPanel value={tab} index={2} title={tabsConfig[2].label} Icon={tabsConfig[2].Icon}>
                    <Typography sx={{ mb: 2 }}>
                        <strong>CONSUMER ELECTRONICS GROUP S.A.S.</strong> fue constituida
                        el 21 de diciembre de 2012, con el objetivo principal de ensamblar
                        televisores, bajo la licencia de Hyundai Corporation. Los planes
                        presentes y futuros incluyen ensamblar para el mercado nacional e
                        internacional.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Somos distribuidores autorizados para Colombia y Latinoamérica de
                        productos electrónicos y electrodomésticos para el hogar y el
                        entretenimiento marca HYUNDAI.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        <strong>CONSUMER ELECTRONICS GROUP S.A.S</strong> surgió como una
                        propuesta visionaria de una familia de la región que ha ido
                        creciendo y se comenzó a fortalecer en el 2016, consolidándose en
                        el mercado nacional, proyectada a exportar el ensamble de
                        televisores de alta calidad a mercados latinoamericanos
                        aprovechando los tratados de comercio con algunos de estos países.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Contamos con una planta de fabricación y centro de distribución
                        con una localización estratégica en el corregimiento de Cerritos a
                        tan solo dos kilómetros de Pereira y conexión con las principales
                        ciudades y de mayor crecimiento en el país.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Comercializamos línea marrón con TV, audio y video y línea blanca
                        con aires acondicionados, neveras, congeladores y lavadoras.
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Tenemos cobertura a nivel nacional en los canales Retail,
                        Tradicional y Mayorista.
                    </Typography>

                    <List sx={{ listStyleType: 'disc', pl: 4, mb: 2 }}>
                        {regions.map((region) => (
                            <ListItem
                                key={region}
                                component="li"
                                sx={{ display: 'list-item', py: 0.25 }}
                            >
                                <ListItemText primary={region} />
                            </ListItem>
                        ))}
                    </List>

                    <Typography sx={{ mb: 0 }}>
                        Nos especializamos en el servicio postventa con un excelente
                        soporte técnico para la atención adecuada y oportuna de garantías
                        y una línea de atención al cliente competente para responder a la
                        necesidad del cliente.
                    </Typography>
                </TabPanel>

                {/* EQUIPO DE TRABAJO — contenido sin cambios */}
                <TabPanel value={tab} index={3} title={tabsConfig[3].label} Icon={tabsConfig[3].Icon}>
                    <Typography sx={{ mb: 2 }}>
                        La declaratoria de los valores y principios definidos van a ser
                        transmitidos a toda la Empresa y a la comunidad en general, a
                        través del siguiente credo:
                    </Typography>

                    <Box
                        sx={{
                            mt: 2,
                            px: { xs: 3, md: 6 },
                            py: 4,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            border: '1px solid',
                            borderColor: 'divider',
                            textAlign: 'center',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontStyle: 'italic', fontWeight: 600, lineHeight: 1.8 }}
                        >
                            “Somos un equipo comprometido que cuenta con una excelente
                            vocación de servicio y resultados. Actuamos con transparencia y
                            oportunidad. Logramos altos estándares de cumplimiento y
                            promulgamos el respeto entre todos y el entorno que nos rodea”.
                        </Typography>
                    </Box>
                </TabPanel>

                {/* NUESTRA CULTURA — contenido sin cambios */}
                <TabPanel value={tab} index={4} title={tabsConfig[4].label} Icon={tabsConfig[4].Icon}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                        Competencias
                    </Typography>

                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 900,
                            mx: 'auto',
                            p: { xs: 2, sm: 3 },
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <ImageFrame
                            maxWidth={720}
                            sx={{ border: 'none', bgcolor: 'transparent', p: 0, borderRadius: 0 }}
                        >
                            <Box
                                component="img"
                                src="/images/creser/01.png"
                                alt="Competencias CRESER"
                                sx={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </ImageFrame>

                        <ImageFrame
                            sx={{ border: 'none', bgcolor: 'transparent', p: 0, borderRadius: 0 }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                                    gap: { xs: 1, sm: 2 },
                                }}
                            >
                                {[3, 4, 5, 6].map((number) => (
                                    <Box
                                        key={number}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Box
                                            component="img"
                                            src={`/images/creser/0${number}.png`}
                                            alt={`Competencia ${number}`}
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: 340,
                                                width: 'auto',
                                                height: 'auto',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </ImageFrame>

                        <ImageFrame
                            maxWidth={420}
                            sx={{ border: 'none', bgcolor: 'transparent', p: 0, borderRadius: 0 }}
                        >
                            <Box
                                component="img"
                                src="/images/creser/02.png"
                                alt="Competencias CRESER"
                                sx={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </ImageFrame>

                        <ImageFrame
                            sx={{ border: 'none', bgcolor: 'transparent', p: 0, borderRadius: 0 }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: { xs: 1, sm: 2 },
                                }}
                            >
                                {[7, 8, 9].map((number) => (
                                    <Box
                                        key={number}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Box
                                            component="img"
                                            src={`/images/creser/0${number}.png`}
                                            alt={`Competencia ${number}`}
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: 300,
                                                width: 'auto',
                                                height: 'auto',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </ImageFrame>
                    </Box>
                </TabPanel>

                {/* POLÍTICA SIG — contenido sin cambios */}
                <TabPanel value={tab} index={5} title={tabsConfig[5].label} Icon={tabsConfig[5].Icon}>
                    <ImageFrame maxWidth={860}>
                        <Box
                            component="a"
                            href="/images/politica-sig.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'block', width: '100%' }}
                        >
                            <Box
                                component="img"
                                src="/images/politica-sig.png"
                                alt="Política SIG"
                                sx={{
                                    display: 'block',
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: { xs: 480, sm: 620, md: 700 },
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    mx: 'auto',
                                }}
                            />
                        </Box>
                    </ImageFrame>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}
                    >
                        Haz clic en la imagen para verla en tamaño completo
                    </Typography>
                </TabPanel>
            </CardContent>
        </Card>
    );
}