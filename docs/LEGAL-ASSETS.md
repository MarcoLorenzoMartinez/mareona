# LEGAL-ASSETS.md — Términos de Activos Visuales y Cumplimiento Legal

## 1. Naturaleza del Proyecto
- Mareona es una plataforma independiente y **no oficial**.
- Debe constar de forma explícita en el footer y en la sección "Acerca de" que el proyecto no cuenta con patrocinio, respaldo ni afiliación con el Real Sporting de Gijón ni con la liga.

## 2. Uso de Escudos de Equipos y Fotos de Jugadores
1. **Punto de entrada único:** Todos los escudos y fotos deben renderizarse a través de `<TeamCrest>` y `<PlayerPhoto>` (`src/components/media/`). Prohibido usar etiquetas `<img>` sueltas.
2. **Origen documentado:** Cada imagen utilizada debe mantener trazabilidad de su origen y condiciones de uso de la API deportiva o fuente correspondiente.
3. **Respeto a condiciones de origen:** Si la API externa no permite rehospedar, las imágenes no se guardan en Supabase Storage; se sirven por URL autorizada mediante `next/image` (`remotePatterns`).
4. **Fallback obligatorio:** Si una imagen falla o no existe, se muestra un placeholder neutro e ilustrativo sin romper el layout.
5. **Interruptor general de retirada:** La variable `NEXT_PUBLIC_SHOW_OFFICIAL_ASSETS` (por defecto `true`) permite sustituir instantáneamente todos los escudos y fotos por placeholders neutros.
6. **Retirada en 48 horas:** Ante cualquier solicitud de titulares de derechos, el activo se retirará en un plazo máximo de 48 horas.
7. **Integridad del escudo:** Prohibido deformar, recolorear, recortar o fusionar los escudos oficiales con el logotipo de Mareona.
8. **Identidad propia:** Los iconos de la PWA, el favicon y las tarjetas Open Graph usan exclusivamente la identidad propia de Mareona.

## 3. Privacidad y RGPD
- Política de privacidad accesible y consentimiento explícito en registro.
- Derecho de supresión de cuenta: Borrado en cascada real de datos de usuario y mensajes privados.
- Chats privados: Los mensajes no se leen ni se registran en logs salvo denuncia expresa. La edad mínima recomendada es de 14 años o más según la normativa aplicable.