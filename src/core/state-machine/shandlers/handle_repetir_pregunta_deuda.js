// /stateHandlers/handle_repetir_pregunta_deuda.js

const handleRepetirPreguntaDeuda = {
    /**
     * Maneja el caso en que la respuesta del usuario no fue clara (ni 'si' ni 'no').
     * Simplemente reitera la pregunta anterior.
     * * @param {object} solicitud - El objeto de la solicitud de préstamo (su estado ya es ESPERANDO_RESPUESTA_DEUDA).
     * @returns {object} La respuesta que se enviará al usuario.
     */
    async handle(solicitud) {
        console.log(`[Handler: RepetirPreguntaDeuda] 🔄 La respuesta fue ambigua. Reiterando pregunta para solicitud ID: ${solicitud.id}`);
        
        // El estado de la solicitud no necesita ser actualizado ya que el controlador lo mantiene.
        
        const repeatedQuestion = 
            "Disculpa, no logré entender tu respuesta. ¿Podrías confirmar si tienes deudas atrasadas en otras entidades bancarias o financieras? " +
            "Por favor, responde **SOLAMENTE con 'Sí' o 'No'.**";

        return { 
            next_message: repeatedQuestion
        };
    }
};

module.exports = handleRepetirPreguntaDeuda;