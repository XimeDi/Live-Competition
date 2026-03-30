export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      search: "Scouting",
      squad: "Tactics",
      leaderboard: "Standings",
      profile: "Manager Profile"
    },
    squad: {
      title: "Tactical Command Center",
      subtitle: "Prepare your tactical lineup for the next Matchday.",
      map: "Tactical Map",
      budget: "Transfer Budget",
      slots: "Squad Slots",
      status: "Submission Status",
      incomplete: "Incomplete",
      needMore: "Need more players",
      formation: "Select Formation",
      ready: "Squad Ready for Kickoff!"
    },
    search: {
      title: "Scouting Database",
      filters: "Scouting Filters",
      searchPlaceholder: "Search player by name...",
      minOvr: "Min. OVR",
      maxPrice: "Max Price",
      budget: "Current Budget",
      prospects: "Prospects Identified",
      sign: "Sign Player",
      scout: "Scout Details",
      noResults: "No matches found",
      noResultsSub: "Your scouts couldn't find any players with the current filters.",
      marketValue: "Market Value",
      any: "Any"
    },
    errors: {
      insubBudget: "Insufficient budget for this signing!",
      maxNation: "Squad limit: Max 3 players from the same nation.",
      wrongPos: "Position mismatch for this tactical slot.",
      alreadyIn: "Player already in your tactical lineup!",
      selectSlot: "Please select a tactical slot on the pitch first."
    }
  },
  es: {
    nav: {
      dashboard: "Panel Real",
      search: "Scouting / Mercado",
      squad: "Pizarra Táctica",
      leaderboard: "Clasificación",
      profile: "Perfil del Míster"
    },
    squad: {
      title: "Centro de Mando Táctico",
      subtitle: "Prepara tu once ideal para la próxima jornada.",
      map: "Pizarra Táctica",
      budget: "Presupuesto de Fichajes",
      slots: "Plazas del Plantel",
      status: "Estado de la Convocatoria",
      incomplete: "Incompleta",
      needMore: "Faltan jugadores",
      formation: "Seleccionar Formación",
      ready: "¡Once listos para el pitazo inicial!"
    },
    search: {
      title: "Base de Datos de Scouting",
      filters: "Filtros de Búsqueda",
      searchPlaceholder: "Buscar crack por nombre...",
      minOvr: "Media Mín. (OVR)",
      maxPrice: "Precio Máximo",
      budget: "Presupuesto Disponible",
      prospects: "Prospectos Identificados",
      sign: "Fichar Cracks",
      scout: "Ver Informe",
      noResults: "No se encontraron resultados",
      noResultsSub: "Tus ojeadores no encontraron jugadores con esos criterios.",
      marketValue: "Valor de Mercado",
      any: "Cualquiera"
    },
    errors: {
      insubBudget: "¡Presupuesto insuficiente para este fichaje!",
      maxNation: "Límite: Máximo 3 jugadores por país.",
      wrongPos: "Posición incorrecta para este puesto táctico.",
      alreadyIn: "¡Este jugador ya está en tu once titular!",
      selectSlot: "Por favor, selecciona primero un puesto en el campo."
    }
  }
}

export type Language = 'en' | 'es'
export type TranslationKey = keyof typeof translations.en
