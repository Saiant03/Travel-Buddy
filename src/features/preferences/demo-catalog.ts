import type { Locale } from '../../shared/contracts/common';
import type { CategoryId } from '../../shared/contracts/preferences';

export type LocalizedText = Readonly<Record<Locale, string>>;

export type DemoItem = Readonly<{
  categoryId: CategoryId;
  subcategoryId: string;
  itemId: string;
  label: LocalizedText;
  group: LocalizedText;
  foodTab?: 'ingredients' | 'dishes' | 'drinks';
}>;

export type DemoCategory = Readonly<{
  id: CategoryId;
  label: LocalizedText;
  title: LocalizedText;
}>;

const text = (ro: string, en: string, fr: string): LocalizedText => ({ ro, en, fr });
const item = (categoryId: CategoryId, subcategoryId: string, itemId: string, label: LocalizedText, group: LocalizedText, foodTab?: DemoItem['foodTab']): DemoItem => ({ categoryId, subcategoryId, itemId, label, group, ...(foodTab ? { foodTab } : {}) });

export const demoCategories: readonly DemoCategory[] = [
  { id: 'food', label: text('Mâncare', 'Food', 'Cuisine'), title: text('Carnetul gusturilor', 'Taste notebook', 'Carnet des goûts') },
  { id: 'culture', label: text('Cultură', 'Culture', 'Culture'), title: text('Carnetul exploratorului', 'Explorer notebook', 'Carnet de l’explorateur') },
  { id: 'nature', label: text('Natură', 'Nature', 'Nature'), title: text('Carnetul naturii', 'Nature notebook', 'Carnet de nature') },
  { id: 'relaxation', label: text('Relaxare', 'Relaxation', 'Détente'), title: text('Carnetul de relaxare', 'Relaxation notebook', 'Carnet de détente') },
  { id: 'shopping', label: text('Shopping', 'Shopping', 'Shopping'), title: text('Carnetul descoperirilor', 'Discoveries notebook', 'Carnet des découvertes') },
];

const food = (sub: string, id: string, label: LocalizedText, group: LocalizedText, tab: DemoItem['foodTab']) => item('food', sub, id, label, group, tab);
const culture = (sub: string, id: string, label: LocalizedText, group: LocalizedText) => item('culture', sub, id, label, group);
const nature = (sub: string, id: string, label: LocalizedText, group: LocalizedText) => item('nature', sub, id, label, group);
const relaxation = (sub: string, id: string, label: LocalizedText, group: LocalizedText) => item('relaxation', sub, id, label, group);
const shopping = (sub: string, id: string, label: LocalizedText, group: LocalizedText) => item('shopping', sub, id, label, group);

export const demoItems: readonly DemoItem[] = [
  // Inventarul alimentar este demonstrativ și extensibil, nu o listă finală aprobată.
  food('vegetables', 'onion', text('Ceapă', 'Onion', 'Oignon'), text('Legume', 'Vegetables', 'Légumes'), 'ingredients'),
  food('vegetables', 'tomato', text('Roșii', 'Tomatoes', 'Tomates'), text('Legume', 'Vegetables', 'Légumes'), 'ingredients'),
  food('meat', 'chicken', text('Pui', 'Chicken', 'Poulet'), text('Carne', 'Meat', 'Viandes'), 'ingredients'),
  food('legumes', 'chickpea', text('Năut', 'Chickpeas', 'Pois chiches'), text('Leguminoase', 'Legumes', 'Légumineuses'), 'ingredients'),
  food('dairy', 'cheese', text('Brânză', 'Cheese', 'Fromage'), text('Ouă și lactate', 'Eggs and dairy', 'Œufs et produits laitiers'), 'ingredients'),
  food('fish', 'salmon', text('Somon', 'Salmon', 'Saumon'), text('Pește', 'Fish', 'Poissons'), 'ingredients'),
  food('dishes', 'pizza', text('Pizza', 'Pizza', 'Pizza'), text('Preparate', 'Dishes', 'Plats'), 'dishes'),
  food('dishes', 'soup', text('Supă', 'Soup', 'Soupe'), text('Preparate', 'Dishes', 'Plats'), 'dishes'),
  food('dishes', 'pasta', text('Paste', 'Pasta', 'Pâtes'), text('Preparate', 'Dishes', 'Plats'), 'dishes'),
  food('coffee', 'espresso', text('Espresso', 'Espresso', 'Espresso'), text('Cafea și ceai', 'Coffee and tea', 'Café et thé'), 'drinks'),
  food('coffee', 'tea', text('Ceai', 'Tea', 'Thé'), text('Cafea și ceai', 'Coffee and tea', 'Café et thé'), 'drinks'),
  food('soft_drinks', 'lemonade', text('Limonadă', 'Lemonade', 'Limonade'), text('Băuturi fără alcool', 'Non-alcoholic drinks', 'Boissons sans alcool'), 'drinks'),

  // Atracții și cultură: fiecare opțiune este selectabilă separat.
  culture('history', 'ancient_ruins', text('Ruine antice', 'Ancient ruins', 'Ruines antiques'), text('Istorie și patrimoniu', 'History and heritage', 'Histoire et patrimoine')),
  culture('history', 'medieval_castles', text('Castele medievale', 'Medieval castles', 'Châteaux médiévaux'), text('Istorie și patrimoniu', 'History and heritage', 'Histoire et patrimoine')),
  culture('museums', 'classical_art', text('Muzee de artă clasică', 'Classical art museums', 'Musées d’art classique'), text('Muzee', 'Museums', 'Musées')),
  culture('museums', 'modern_art', text('Muzee de artă modernă', 'Modern art museums', 'Musées d’art moderne'), text('Muzee', 'Museums', 'Musées')),
  culture('museums', 'history', text('Muzee de istorie', 'History museums', 'Musées d’histoire'), text('Muzee', 'Museums', 'Musées')),
  culture('museums', 'science', text('Muzee de știință', 'Science museums', 'Musées des sciences'), text('Muzee', 'Museums', 'Musées')),
  culture('museums', 'technology', text('Muzee de tehnică', 'Technology museums', 'Musées techniques'), text('Muzee', 'Museums', 'Musées')),
  culture('museums', 'transport', text('Muzee de transport', 'Transport museums', 'Musées des transports'), text('Muzee', 'Museums', 'Musées')),
  culture('art', 'galleries', text('Galerii de artă', 'Art galleries', 'Galeries d’art'), text('Artă', 'Art', 'Art')),
  culture('art', 'street_art', text('Artă stradală', 'Street art', 'Art urbain'), text('Artă', 'Art', 'Art')),
  culture('architecture', 'historic_buildings', text('Clădiri istorice', 'Historic buildings', 'Bâtiments historiques'), text('Arhitectură și oraș', 'Architecture and city', 'Architecture et ville')),
  culture('architecture', 'old_quarters', text('Cartiere vechi', 'Old quarters', 'Vieux quartiers'), text('Arhitectură și oraș', 'Architecture and city', 'Architecture et ville')),
  culture('religious', 'churches', text('Biserici și catedrale', 'Churches and cathedrals', 'Églises et cathédrales'), text('Patrimoniu religios', 'Religious heritage', 'Patrimoine religieux')),
  culture('religious', 'temples', text('Temple', 'Temples', 'Temples'), text('Patrimoniu religios', 'Religious heritage', 'Patrimoine religieux')),
  culture('local_life', 'local_markets', text('Piețe locale', 'Local markets', 'Marchés locaux'), text('Viață locală și tradiții', 'Local life and traditions', 'Vie locale et traditions')),
  culture('local_life', 'craft_workshops', text('Ateliere de meșteșugari', 'Craft workshops', 'Ateliers d’artisans'), text('Viață locală și tradiții', 'Local life and traditions', 'Vie locale et traditions')),
  culture('shows', 'live_music', text('Muzică live', 'Live music', 'Musique live'), text('Spectacole', 'Performances', 'Spectacles')),
  culture('shows', 'theatre', text('Teatru', 'Theatre', 'Théâtre'), text('Spectacole', 'Performances', 'Spectacles')),
  culture('views', 'viewpoints', text('Puncte de belvedere', 'Viewpoints', 'Points de vue'), text('Panorame și fotografie', 'Views and photography', 'Panoramas et photographie')),
  culture('views', 'sunsets', text('Locuri pentru apus', 'Sunset spots', 'Lieux pour admirer le coucher du soleil'), text('Panorame și fotografie', 'Views and photography', 'Panoramas et photographie')),

  // Activități și natură.
  nature('walks_hikes', 'easy_walks', text('Trasee ușoare', 'Easy trails', 'Sentiers faciles'), text('Plimbări și drumeții', 'Walks and hikes', 'Promenades et randonnées')),
  nature('walks_hikes', 'challenging_hikes', text('Drumeții solicitante', 'Challenging hikes', 'Randonnées exigeantes'), text('Plimbări și drumeții', 'Walks and hikes', 'Promenades et randonnées')),
  nature('landscapes', 'forests', text('Păduri', 'Forests', 'Forêts'), text('Peisaje și natură', 'Landscapes and nature', 'Paysages et nature')),
  nature('landscapes', 'mountains', text('Munți', 'Mountains', 'Montagnes'), text('Peisaje și natură', 'Landscapes and nature', 'Paysages et nature')),
  nature('landscapes', 'lakes', text('Lacuri', 'Lakes', 'Lacs'), text('Peisaje și natură', 'Landscapes and nature', 'Paysages et nature')),
  nature('landscapes', 'waterfalls', text('Cascade', 'Waterfalls', 'Cascades'), text('Peisaje și natură', 'Landscapes and nature', 'Paysages et nature')),
  nature('water', 'kayak', text('Caiac', 'Kayaking', 'Kayak'), text('Pe apă', 'On the water', 'Sur l’eau')),
  nature('water', 'boat_trip', text('Plimbări cu barca', 'Boat trips', 'Promenades en bateau'), text('Pe apă', 'On the water', 'Sur l’eau')),
  nature('in_water', 'snorkeling', text('Snorkeling', 'Snorkeling', 'Plongée avec tuba'), text('În apă', 'In the water', 'Dans l’eau')),
  nature('in_water', 'swimming', text('Înot', 'Swimming', 'Natation'), text('În apă', 'In the water', 'Dans l’eau')),
  nature('adventure', 'zipline', text('Tiroliană', 'Zip-lining', 'Tyrolienne'), text('Aventură și înălțime', 'Adventure and heights', 'Aventure et hauteur')),
  nature('adventure', 'climbing', text('Escaladă', 'Climbing', 'Escalade'), text('Aventură și înălțime', 'Adventure and heights', 'Aventure et hauteur')),
  nature('sports', 'cycling', text('Bicicletă', 'Cycling', 'Vélo'), text('Sport și mișcare', 'Sports and movement', 'Sport et mouvement')),
  nature('sports', 'horse_riding', text('Echitație', 'Horse riding', 'Équitation'), text('Sport și mișcare', 'Sports and movement', 'Sport et mouvement')),
  nature('snow', 'skiing', text('Schi', 'Skiing', 'Ski'), text('Zăpadă', 'Snow', 'Neige')),
  nature('snow', 'snowshoeing', text('Plimbări cu rachete de zăpadă', 'Snowshoeing', 'Raquettes à neige'), text('Zăpadă', 'Snow', 'Neige')),
  nature('animals', 'birdwatching', text('Observarea păsărilor', 'Birdwatching', 'Observation des oiseaux'), text('Animale și natură vie', 'Wildlife and animals', 'Faune et animaux')),
  nature('animals', 'aquariums', text('Acvarii', 'Aquariums', 'Aquariums'), text('Animale și natură vie', 'Wildlife and animals', 'Faune et animaux')),
  nature('workshops', 'cooking', text('Ateliere de gătit', 'Cooking workshops', 'Ateliers de cuisine'), text('Ateliere și experiențe locale', 'Workshops and local experiences', 'Ateliers et expériences locales')),
  nature('workshops', 'ceramics', text('Ateliere de ceramică', 'Ceramics workshops', 'Ateliers de céramique'), text('Ateliere și experiențe locale', 'Workshops and local experiences', 'Ateliers et expériences locales')),
  nature('fun', 'theme_parks', text('Parcuri de distracții', 'Theme parks', 'Parcs d’attractions'), text('Distracție și jocuri', 'Fun and games', 'Divertissement et jeux')),
  nature('fun', 'escape_rooms', text('Escape room-uri', 'Escape rooms', 'Jeux d’évasion'), text('Distracție și jocuri', 'Fun and games', 'Divertissement et jeux')),

  // Relaxare.
  relaxation('beach', 'sandy_beach', text('Plajă cu nisip', 'Sandy beach', 'Plage de sable'), text('Plajă', 'Beach', 'Plage')),
  relaxation('beach', 'quiet_cove', text('Golfuri retrase', 'Quiet coves', 'Criques tranquilles'), text('Plajă', 'Beach', 'Plage')),
  relaxation('water_pools', 'outdoor_pool', text('Piscine în aer liber', 'Outdoor pools', 'Piscines extérieures'), text('Apă și piscine', 'Water and pools', 'Eau et piscines')),
  relaxation('water_pools', 'swimming_in_lakes', text('Înot în lacuri amenajate', 'Swimming in designated lakes', 'Baignade dans des lacs aménagés'), text('Apă și piscine', 'Water and pools', 'Eau et piscines')),
  relaxation('spa', 'massage', text('Masaj', 'Massage', 'Massage'), text('Spa și wellness', 'Spa and wellness', 'Spa et bien-être')),
  relaxation('spa', 'sauna', text('Saună', 'Sauna', 'Sauna'), text('Spa și wellness', 'Spa and wellness', 'Spa et bien-être')),
  relaxation('thermal', 'natural_thermal_baths', text('Băi termale în natură', 'Natural thermal baths', 'Bains thermaux en pleine nature'), text('Ape termale', 'Thermal waters', 'Eaux thermales')),
  relaxation('thermal', 'thermal_centres', text('Centre termale', 'Thermal spas', 'Centres thermaux'), text('Ape termale', 'Thermal waters', 'Eaux thermales')),
  relaxation('greenery', 'botanical_gardens', text('Grădini botanice', 'Botanical gardens', 'Jardins botaniques'), text('Verdeață și liniște', 'Green spaces and quiet', 'Verdure et tranquillité')),
  relaxation('greenery', 'picnic', text('Picnic în parc', 'Picnic in a park', 'Pique-nique au parc'), text('Verdeață și liniște', 'Green spaces and quiet', 'Verdure et tranquillité')),
  relaxation('city_breaks', 'quiet_cafes', text('Cafenele liniștite', 'Quiet cafés', 'Cafés tranquilles'), text('Pauze în oraș', 'City breaks', 'Pauses en ville')),
  relaxation('city_breaks', 'slow_seaside_walks', text('Plimbări lente pe faleză', 'Slow walks along the waterfront', 'Promenades tranquilles sur le front de mer'), text('Pauze în oraș', 'City breaks', 'Pauses en ville')),
  relaxation('rest', 'time_at_accommodation', text('Timp de odihnă la cazare', 'Rest time at the accommodation', 'Temps de repos au logement'), text('Odihnă și stare de bine', 'Rest and wellbeing', 'Repos et bien-être')),
  relaxation('rest', 'sunset_walks', text('Plimbări la apus', 'Sunset walks', 'Promenades au coucher du soleil'), text('Odihnă și stare de bine', 'Rest and wellbeing', 'Repos et bien-être')),

  // Shopping: produse și locuri au identificatori de grup distincte.
  shopping('local_crafts', 'ceramics', text('Ceramică locală', 'Local ceramics', 'Céramique locale'), text('Produse locale și artizanat', 'Local goods and crafts', 'Produits locaux et artisanat')),
  shopping('local_crafts', 'handmade_jewellery', text('Bijuterii lucrate manual', 'Handmade jewellery', 'Bijoux faits main'), text('Produse locale și artizanat', 'Local goods and crafts', 'Produits locaux et artisanat')),
  shopping('souvenirs', 'postcards', text('Cărți poștale', 'Postcards', 'Cartes postales'), text('Suveniruri', 'Souvenirs', 'Souvenirs')),
  shopping('souvenirs', 'local_gifts', text('Cadouri locale', 'Local gifts', 'Cadeaux locaux'), text('Suveniruri', 'Souvenirs', 'Souvenirs')),
  shopping('food_to_take_home', 'regional_sweets', text('Dulciuri regionale', 'Regional sweets', 'Douceurs régionales'), text('Produse alimentare de luat acasă', 'Food to take home', 'Produits alimentaires à emporter')),
  shopping('food_to_take_home', 'local_spices', text('Condimente locale', 'Local spices', 'Épices locales'), text('Produse alimentare de luat acasă', 'Food to take home', 'Produits alimentaires à emporter')),
  shopping('clothing_footwear', 'local_designers', text('Designeri locali', 'Local designers', 'Créateurs locaux'), text('Haine și încălțăminte', 'Clothing and footwear', 'Vêtements et chaussures')),
  shopping('clothing_footwear', 'vintage_clothing', text('Haine vintage', 'Vintage clothing', 'Vêtements vintage'), text('Haine și încălțăminte', 'Clothing and footwear', 'Vêtements et chaussures')),
  shopping('accessories', 'bags', text('Genți', 'Bags', 'Sacs'), text('Accesorii', 'Accessories', 'Accessoires')),
  shopping('accessories', 'watches', text('Ceasuri', 'Watches', 'Montres'), text('Accesorii', 'Accessories', 'Accessoires')),
  shopping('cosmetics', 'local_cosmetics', text('Cosmetice locale', 'Local cosmetics', 'Cosmétiques locaux'), text('Cosmetice și parfumuri', 'Cosmetics and perfumes', 'Cosmétiques et parfums')),
  shopping('cosmetics', 'perfumes', text('Parfumuri', 'Perfumes', 'Parfums'), text('Cosmetice și parfumuri', 'Cosmetics and perfumes', 'Cosmétiques et parfums')),
  shopping('home_decor', 'design_objects', text('Obiecte de design', 'Design objects', 'Objets de design'), text('Casă și decor', 'Home and décor', 'Maison et décoration')),
  shopping('home_decor', 'antiques', text('Antichități', 'Antiques', 'Antiquités'), text('Casă și decor', 'Home and décor', 'Maison et décoration')),
  shopping('books_hobbies', 'bookshops', text('Librării', 'Bookshops', 'Librairies'), text('Cărți, muzică și hobby-uri', 'Books, music and hobbies', 'Livres, musique et loisirs')),
  shopping('books_hobbies', 'vinyl_records', text('Discuri de vinil', 'Vinyl records', 'Disques vinyles'), text('Cărți, muzică și hobby-uri', 'Books, music and hobbies', 'Livres, musique et loisirs')),
  shopping('technology', 'electronics', text('Electronice', 'Electronics', 'Électronique'), text('Tehnologie', 'Technology', 'Technologie')),
  shopping('technology', 'phone_accessories', text('Accesorii pentru telefon', 'Phone accessories', 'Accessoires pour téléphone'), text('Tehnologie', 'Technology', 'Technologie')),
  shopping('places', 'traditional_markets', text('Piețe tradiționale', 'Traditional markets', 'Marchés traditionnels'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'craft_fairs', text('Târguri de artizanat', 'Craft fairs', 'Marchés d’artisanat'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'flea_markets', text('Talciocuri', 'Flea markets', 'Marchés aux puces'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'independent_boutiques', text('Buticuri independente', 'Independent boutiques', 'Boutiques indépendantes'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'maker_shops', text('Ateliere și magazine ale producătorilor', 'Makers’ workshops and shops', 'Ateliers et boutiques de producteurs'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'shopping_streets', text('Străzi comerciale', 'Shopping streets', 'Rues commerçantes'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'department_stores', text('Magazine universale', 'Department stores', 'Grands magasins'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'malls', text('Malluri', 'Shopping malls', 'Centres commerciaux'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
  shopping('places', 'outlets', text('Outleturi', 'Outlet stores', 'Magasins d’usine'), text('Tipuri de locuri', 'Types of places', 'Types de lieux')),
];
