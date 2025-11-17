// --- System Configuration ---
export const MANAGER_EMAIL = "manager@restaurant-app-alerts.com"; 
export const MANAGER_PASSWORD = "Paiges"; 
export const MANAGER_TEST_PASSWORD = "test"; // Added for easy testing

// --- Temperature Logging Configuration (11 UNITS) ---
export const TEMPERATURE_LOG_KEYS = [
    'Kitchen_Meat_Cooler', 'Kitchen_Fry_Freezer', 'Kitchen_Waffle_Cooler', 'Kitchen_Sandwich_Cooler',
    'Back_Meat_Cooler', 'Back_Fry_Freezer', 'Back_Produce_Cooler',
    'Front_Silver_Cooler', 
    'Front_Drink_Cooler', 'Front_Cheesecake_Freezer', 'Front_Counter_Drink_Cooler' 
];
export const TEMPERATURE_LOG_NAMES: { [key: string]: string } = {
    Kitchen_Meat_Cooler: 'Kitchen Meat Cooler',
    Kitchen_Fry_Freezer: 'Kitchen Fry Freezer',
    Kitchen_Waffle_Cooler: 'Kitchen Waffle Cooler',
    Kitchen_Sandwich_Cooler: 'Kitchen Sandwich Cooler',
    Back_Meat_Cooler: 'Back Storage Meat Cooler',
    Back_Fry_Freezer: 'Back Storage Fry Freezer',
    Back_Produce_Cooler: 'Back Storage Produce Cooler',
    Front_Silver_Cooler: 'Front Storage Silver Cooler',
    Front_Drink_Cooler: 'Front Storage Drink Cooler', 
    Front_Cheesecake_Freezer: 'Front Storage Cheesecake Freezer', 
    Front_Counter_Drink_Cooler: 'Front Counter Drink Cooler', 
};
export const TEMPERATURE_LOG_STANDARDS: { [key: string]: string } = {
    Kitchen_Meat_Cooler: '41°F or below',
    Kitchen_Fry_Freezer: '0°F or below',
    Kitchen_Waffle_Cooler: '41°F or below',
    Kitchen_Sandwich_Cooler: '41°F or below',
    Back_Meat_Cooler: '41°F or below',
    Back_Fry_Freezer: '0°F or below',
    Back_Produce_Cooler: '41°F or below',
    Front_Silver_Cooler: '41°F or below',
    Front_Drink_Cooler: '41°F or below', 
    Front_Cheesecake_Freezer: '0°F or below', 
    Front_Counter_Drink_Cooler: '41°F or below', 
};

// --- Task Definitions for BOH Stations ---
export const BOH_STATION_TASKS = {
    fryer_station: {
        name: '1. Fryer Station (3 Fryers & Cold Prep)',
        tasks: [
            'Drain, filter oil, and clean all 3 fryer pots/baskets.',
            'Clean and sanitize the adjacent prep table surface.',
            'Check meat cooler temperature (under 41°F).',
            'Ensure French fry freezer door is sealed and floor clear.',
            'Sweep/mop floor and clean surrounding walls around fryers and prep.',
        ]
    },
    flattop_burner: {
        name: '2. Flattop & 6-Eye Burner Station',
        tasks: [
            'Scrape, scrub clean, and lightly oil the flattop.',
            'Remove grates from 6-eye burner, clean drip trays, and wipe exterior.',
            'Clean and sanitize the adjacent table and hot warmer well exterior.',
            'Verify hot warmer well water is clean and temperature is set (over 135°F).',
            'Clean surrounding walls and sweep/mop floor area.',
        ]
    },
    waffle_station: {
        name: '3. Waffle Maker Station',
        tasks: [
            'Scrape off and wipe down 2 waffle makers (plates and exterior).',
            'Clean and sanitize the waffle batter prep surface.',
            'Check waffle maker cooler temperature (under 41°F).',
            'Restock waffle mix/ingredients as needed.',
            'Clean surrounding walls and sweep/mop floor area.',
        ]
    },
    expo_station_prep: {
        name: '4. Expo & Sandwich Prep Station',
        tasks: [
            'Clean and sanitize expo prep table surface.',
            'Wipe down POS/printer/monitor at expo station.',
            'Clean and organize double door sandwich cooler (exterior/interior).',
            'Check sandwich cooler temperature (under 41°F).',
            'Restock all side containers and condiments.',
            'Clean surrounding walls and sweep/mop floor area.',
        ]
    },
    dish_station: {
        name: '5. Dish & Prep Sink Station',
        tasks: [
            'Clean out the interior of the 3-compartment sink.',
            'Test and log sanitizer concentration in 3-comp sink.',
            'Clean and sanitize the dish rack area and wipe down dish machine exterior.',
            'Clean and sanitize the prep sink and two adjacent prep tables.',
            'Clean surrounding walls and sweep/squeegee water from floor near sinks.',
        ]
    }
};

// Create the combined BOH Audit list (25 cleaning tasks only)
export const combinedBohTasks = [
    ...BOH_STATION_TASKS.fryer_station.tasks.map(t => `[Fryer] ${t}`),
    ...BOH_STATION_TASKS.flattop_burner.tasks.map(t => `[Flattop] ${t}`),
    ...BOH_STATION_TASKS.waffle_station.tasks.map(t => `[Waffle] ${t}`),
    ...BOH_STATION_TASKS.expo_station_prep.tasks.map(t => `[Expo] ${t}`),
    ...BOH_STATION_TASKS.dish_station.tasks.map(t => `[Dish] ${t}`),
];

// Initial Data Seed
export const initialChecklistsData = [
    {
        id: 'health',
        name: 'Health Compliance',
        tasks: [
            // Standard non-temp tasks (5 total)
            'Verify all raw foods are stored below ready-to-eat foods.',
            'Test and log 3-compartment sink sanitizer concentration (e.g., 50-100 PPM).',
            'Ensure handwashing sinks are fully stocked and accessible.',
            'Confirm no bare-hand contact with ready-to-eat food (gloves/utensils used).',
            'Check and log internal cooking temperatures (Pork/Fish 145°F, Poultry 165°F).',
             // Add the 11 temperature log tasks here (start index 5)
            ...TEMPERATURE_LOG_KEYS.map(key => `[Temp Log] Record temperature for ${TEMPERATURE_LOG_NAMES[key]} (Standard: ${TEMPERATURE_LOG_STANDARDS[key]}).`),
        ]
    },
    { 
        id: 'foh', 
        name: 'FOH Opening Checklist',
        tasks: [
            'Turn on lights, set music/ambiance.',
            'Wipe down all tables, chairs, and booths.',
            'Spot clean all windows and glass doors (remove smudges).',
            'Fold and stock all napkins/silverware roll-ups.',
            'Stock server station and fill ice bins.',
            'Wipe down and sanitize all menus.',
            'Check FOH trash receptacles (empty and wipe exteriors).',
        ]
    },
    { 
        id: 'restroom', 
        name: 'Restroom Cleanliness',
        tasks: [
            'Clean and sanitize toilet bowls and seats.',
            'Wipe down sinks, counters, and mirrors.',
            'Restock toilet paper and paper towels.',
            'Refill soap dispensers.',
            'Empty trash receptacle and replace liner.',
            'Spot mop floor and address any odors.',
        ]
    },
    // --- Individual BOH Checklists (1-5) ---
    { id: 'fryer_station', ...BOH_STATION_TASKS.fryer_station },
    { id: 'flattop_burner', ...BOH_STATION_TASKS.flattop_burner },
    { id: 'waffle_station', ...BOH_STATION_TASKS.waffle_station },
    { id: 'expo_station_prep', ...BOH_STATION_TASKS.expo_station_prep },
    { id: 'dish_station', ...BOH_STATION_TASKS.dish_station },
    
    // --- BOH Supervisor Audit (6) ---
    {
        id: 'boh_supervisor_audit',
        name: '6. BOH Supervisor Audit (All Stations)',
        tasks: combinedBohTasks, // 25 BOH tasks only (NO TEMP LOGS HERE)
    },
];

// --- Custom Display Order for Employee Dropdown ---
export const DISPLAY_ORDER_IDS = [
    'health', 
    'foh', 
    'restroom', 
    'fryer_station', 
    'flattop_burner', 
    'waffle_station', 
    'expo_station_prep', 
    'dish_station', 
    'boh_supervisor_audit'
];