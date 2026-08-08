const I18N = {
    // Current language
    currentLang: localStorage.getItem('lang') || 'en',

    // Available languages
    languages: {
        en: { name: 'English', flag: '🇬🇧' },
        de: { name: 'Deutsch', flag: '🇩🇪' },
        fr: { name: 'Français', flag: '🇫🇷' },
        es: { name: 'Español', flag: '🇪🇸' },
        it: { name: 'Italiano', flag: '🇮🇹' }
    },

    // Translations
    translations: {
        en: {
            // Navigation
            nav_home: 'Home',
            nav_products: 'Products',
            nav_dashboard: 'Dashboard',
            nav_login: 'Login',
            nav_logout: 'Logout',
            nav_cart: 'Cart',

            // Hero
            hero_title: 'Summer Collection 2026',
            hero_subtitle: 'Discover premium products with up to 50% off. Limited time offer!',
            hero_cta: 'Shop Now',

            // Products
            products_title: 'Our Products',
            filter_all: 'All',
            filter_electronics: 'Electronics',
            filter_fashion: 'Fashion',
            filter_home: 'Home',
            add_to_cart: 'Add to Cart',
            added: 'Added!',
            adding: 'Adding...',
            toast_adding: 'adding to cart...',
            search_placeholder: 'Search products...',
            stock_warning: 'Only {count} left in stock',
            out_of_stock: 'Out of Stock',

            // Cart
            cart_title: 'Shopping Cart',
            cart_empty: 'Your cart is empty',
            cart_continue: 'Continue Shopping',
            cart_total: 'Total:',
            cart_checkout: 'Proceed to Checkout',
            cart_remove: 'Remove',
            cart_quantity: 'Quantity',

            // Checkout
            checkout_title: 'Complete Order',
            select_address: 'Select Delivery Address',
            new_address: 'New Address',
            address_label: 'Label (e.g. Home, Work)',
            address_street: 'Street & Number',
            address_zip: 'ZIP Code',
            address_city: 'City',
            address_state: 'State',
            address_country: 'Country',
            save_address: 'Save Address',
            cancel: 'Cancel',
            payment_method: 'Payment Method',
            card_number: 'Card Number',
            card_expiry: 'Expiry Date',
            card_cvc: 'CVC',
            pay_now: 'Pay Now',
            pay_amount: 'Pay',
            processing: 'Processing...',

            // Login/Register
            login_title: 'Welcome Back',
            login_subtitle: 'Sign in to continue',
            login_email: 'Email Address',
            login_password: 'Password',
            login_button: 'Sign In',
            login_loading: 'Signing in...',
            no_account: 'No account?',
            register_now: 'Register now',

            register_title: 'Create Account',
            register_subtitle: 'Register for a better shopping experience',
            register_firstname: 'First Name',
            register_lastname: 'Last Name',
            register_phone: 'Phone (optional)',
            register_avatar_hint: 'Click to upload profile photo (max 500KB)',
            register_password: 'Password (min. 6 characters)',
            register_confirm: 'Confirm Password',
            register_button: 'Create Account',
            register_loading: 'Creating account...',
            has_account: 'Already registered?',
            login_here: 'Sign in here',

            // Dashboard
            dash_overview: 'Overview',
            dash_orders: 'My Orders',
            dash_addresses: 'Addresses',
            dash_profile: 'Edit Profile',
            dash_shop: 'Go to Shop',
            dash_stats_orders: 'Orders',
            dash_stats_spent: 'Total Spent',
            dash_stats_addresses: 'Addresses',
            dash_stats_cart: 'Cart Items',
            dash_profile_title: 'Profile Overview',
            dash_profile_edit: 'Edit',
            dash_name: 'Name',
            dash_email: 'Email',
            dash_phone: 'Phone',
            dash_member_since: 'Member Since',
            dash_recent_orders: 'Recent Orders',
            dash_view_all: 'View All',
            dash_order_number: 'Order #',
            dash_order_date: 'Date',
            dash_order_amount: 'Amount',
            dash_order_status: 'Status',
            dash_order_details: 'Details',
            dash_order_cancel: 'Cancel',
            dash_no_orders: 'No orders yet',
            dash_addresses_title: 'Saved Addresses',
            dash_add_address: 'Add Address',
            dash_address_default: 'Default',
            dash_address_edit: 'Edit',
            dash_address_delete: 'Delete',
            dash_no_addresses: 'No addresses saved',
            dash_profile_save: 'Save',

            // Order Status
            status_pending: 'Pending',
            status_processing: 'Processing',
            status_shipped: 'Shipped',
            status_delivered: 'Delivered',
            status_cancelled: 'Cancelled',

            // Footer
            footer_about: 'About',
            footer_links: 'Quick Links',
            footer_service: 'Customer Service',
            footer_contact: 'Contact',
            footer_email: 'support@luxemarket.com',
            footer_phone: '+1 (555) 123-4567',
            footer_address: '123 Commerce St, NY',
            footer_copyright: 'All rights reserved',

            // Toast Messages
            toast_added: 'added to cart!',
            toast_removed: 'Item removed',
            toast_login_required: 'Please login to checkout',
            toast_order_success: 'Order placed successfully!',
            toast_order_cancelled: 'Order cancelled',
            toast_address_saved: 'Address saved',
            toast_address_deleted: 'Address deleted',
            toast_profile_updated: 'Profile updated',
            toast_error: 'An error occurred',
            toast_server_error: 'Server not available',

            // Misc
            back_to_shop: 'Back to Shop',
            loading: 'Loading...',
            price_original: 'Original price',
            sale: 'SALE',
            new: 'NEW',
            germany: 'Germany',
            austria: 'Austria',
            switzerland: 'Switzerland',
            usa: 'United States',
            uk: 'United Kingdom',
            france: 'France',
            spain: 'Spain',
            italy: 'Italy'
        },

        de: {
            // Navigation
            nav_home: 'Home',
            nav_products: 'Produkte',
            nav_dashboard: 'Dashboard',
            nav_login: 'Anmelden',
            nav_logout: 'Abmelden',
            nav_cart: 'Warenkorb',

            // Hero
            hero_title: 'Summer Collection 2026',
            hero_subtitle: 'Entdecke Premium-Produkte mit bis zu 50% Rabatt. Limitiertes Angebot!',
            hero_cta: 'Jetzt shoppen',

            // Products
            products_title: 'Unsere Produkte',
            filter_all: 'Alle',
            filter_electronics: 'Elektronik',
            filter_fashion: 'Mode',
            filter_home: 'Wohnen',
            add_to_cart: 'In den Warenkorb',
            added: 'Hinzugefügt!',
            adding: 'Hinzufügen...',
            toast_adding: 'wird zum Warenkorb hinzugefügt...',
            search_placeholder: 'Produkte suchen...',
            stock_warning: 'Nur noch {count} auf Lager',
            out_of_stock: 'Nicht verfügbar',

            // Cart
            cart_title: 'Warenkorb',
            cart_empty: 'Ihr Warenkorb ist leer',
            cart_continue: 'Weiter shoppen',
            cart_total: 'Gesamt:',
            cart_checkout: 'Zur Kasse',
            cart_remove: 'Entfernen',
            cart_quantity: 'Menge',

            // Checkout
            checkout_title: 'Bestellung abschließen',
            select_address: 'Lieferadresse wählen',
            new_address: 'Neue Adresse',
            address_label: 'Bezeichnung (z.B. Zuhause, Arbeit)',
            address_street: 'Straße und Hausnummer',
            address_zip: 'PLZ',
            address_city: 'Stadt',
            address_state: 'Bundesland',
            address_country: 'Land',
            save_address: 'Adresse speichern',
            cancel: 'Abbrechen',
            payment_method: 'Zahlungsmethode',
            card_number: 'Kartennummer',
            card_expiry: 'Ablaufdatum',
            card_cvc: 'CVC',
            pay_now: 'Jetzt bezahlen',
            pay_amount: 'Bezahlen',
            processing: 'Verarbeite...',

            // Login/Register
            login_title: 'Willkommen zurück',
            login_subtitle: 'Melden Sie sich an, um fortzufahren',
            login_email: 'E-Mail-Adresse',
            login_password: 'Passwort',
            login_button: 'Anmelden',
            login_loading: 'Anmelden...',
            no_account: 'Noch kein Konto?',
            register_now: 'Jetzt registrieren',

            register_title: 'Konto erstellen',
            register_subtitle: 'Registrieren Sie sich für ein besseres Einkaufserlebnis',
            register_firstname: 'Vorname',
            register_lastname: 'Nachname',
            register_phone: 'Telefon (optional)',
            register_avatar_hint: 'Foto hochladen (max 500KB)',
            register_password: 'Passwort (min. 6 Zeichen)',
            register_confirm: 'Passwort bestätigen',
            register_button: 'Konto erstellen',
            register_loading: 'Registriere...',
            has_account: 'Bereits registriert?',
            login_here: 'Hier anmelden',

            // Dashboard
            dash_overview: 'Übersicht',
            dash_orders: 'Meine Bestellungen',
            dash_addresses: 'Adressen',
            dash_profile: 'Profil bearbeiten',
            dash_shop: 'Zum Shop',
            dash_stats_orders: 'Bestellungen',
            dash_stats_spent: 'Gesamtausgaben',
            dash_stats_addresses: 'Adressen',
            dash_stats_cart: 'Warenkorb',
            dash_profile_title: 'Profilübersicht',
            dash_profile_edit: 'Bearbeiten',
            dash_name: 'Name',
            dash_email: 'E-Mail',
            dash_phone: 'Telefon',
            dash_member_since: 'Mitglied seit',
            dash_recent_orders: 'Letzte Bestellungen',
            dash_view_all: 'Alle anzeigen',
            dash_order_number: 'Bestellnr.',
            dash_order_date: 'Datum',
            dash_order_amount: 'Betrag',
            dash_order_status: 'Status',
            dash_order_details: 'Details',
            dash_order_cancel: 'Stornieren',
            dash_no_orders: 'Noch keine Bestellungen',
            dash_addresses_title: 'Gespeicherte Adressen',
            dash_add_address: 'Neue Adresse',
            dash_address_default: 'Standard',
            dash_address_edit: 'Bearbeiten',
            dash_address_delete: 'Löschen',
            dash_no_addresses: 'Keine Adressen vorhanden',
            dash_profile_save: 'Speichern',

            // Order Status
            status_pending: 'Ausstehend',
            status_processing: 'In Bearbeitung',
            status_shipped: 'Versendet',
            status_delivered: 'Geliefert',
            status_cancelled: 'Storniert',

            // Footer
            footer_about: 'Über uns',
            footer_links: 'Quick Links',
            footer_service: 'Kundenservice',
            footer_contact: 'Kontakt',
            footer_email: 'support@luxemarket.de',
            footer_phone: '+49 (0) 30 12345678',
            footer_address: 'Musterstraße 123, Berlin',
            footer_copyright: 'Alle Rechte vorbehalten',

            // Toast Messages
            toast_added: 'hinzugefügt!',
            toast_removed: 'Artikel entfernt',
            toast_login_required: 'Bitte einloggen zur Kasse',
            toast_order_success: 'Bestellung erfolgreich!',
            toast_order_cancelled: 'Bestellung storniert',
            toast_address_saved: 'Adresse gespeichert',
            toast_address_deleted: 'Adresse gelöscht',
            toast_profile_updated: 'Profil aktualisiert',
            toast_error: 'Ein Fehler ist aufgetreten',
            toast_server_error: 'Server nicht erreichbar',

            // Misc
            back_to_shop: 'Zurück zum Shop',
            loading: 'Lade...',
            price_original: 'Ursprünglicher Preis',
            sale: 'SALE',
            new: 'NEU',
            germany: 'Deutschland',
            austria: 'Österreich',
            switzerland: 'Schweiz',
            usa: 'Vereinigte Staaten',
            uk: 'Vereinigtes Königreich',
            france: 'Frankreich',
            spain: 'Spanien',
            italy: 'Italien'
        },

        fr: {
            nav_home: 'Accueil',
            nav_products: 'Produits',
            nav_dashboard: 'Tableau de bord',
            nav_login: 'Connexion',
            nav_logout: 'Déconnexion',
            nav_cart: 'Panier',
            hero_title: 'Collection Été 2026',
            hero_subtitle: "Découvrez des produits premium avec jusqu'à 50% de réduction. Offre limitée!",
            hero_cta: 'Acheter maintenant',
            products_title: 'Nos Produits',
            filter_all: 'Tous',
            filter_electronics: 'Électronique',
            filter_fashion: 'Mode',
            filter_home: 'Maison',
            add_to_cart: 'Ajouter au panier',
            added: 'Ajouté!',
            adding: 'Ajout en cours...',
            toast_adding: 'ajout au panier en cours...',
            search_placeholder: 'Rechercher des produits...',
            stock_warning: 'Plus que {count} en stock',
            cart_title: 'Panier',
            cart_empty: 'Votre panier est vide',
            cart_continue: 'Continuer les achats',
            cart_total: 'Total:',
            cart_checkout: 'Passer la commande',
            checkout_title: 'Finaliser la commande',
            select_address: "Choisir l'adresse de livraison",
            new_address: 'Nouvelle adresse',
            save_address: 'Enregistrer',
            cancel: 'Annuler',
            pay_now: 'Payer maintenant',
            login_title: 'Bienvenue',
            login_subtitle: 'Connectez-vous pour continuer',
            login_button: 'Se connecter',
            register_title: 'Créer un compte',
            register_button: 'Créer',
            dash_overview: 'Aperçu',
            dash_orders: 'Mes commandes',
            dash_addresses: 'Adresses',
            dash_profile: 'Modifier le profil',
            dash_stats_orders: 'Commandes',
            dash_stats_spent: 'Dépenses totales',
            dash_stats_addresses: 'Adresses',
            dash_stats_cart: 'Articles',
            status_pending: 'En attente',
            status_processing: 'En cours',
            status_shipped: 'Expédié',
            status_delivered: 'Livré',
            status_cancelled: 'Annulé',
            toast_added: 'ajouté au panier!',
            toast_error: 'Une erreur est survenue',
            loading: 'Chargement...',
            sale: 'SOLDES',
            new: 'NOUVEAU'
        },

        es: {
            nav_home: 'Inicio',
            nav_products: 'Productos',
            nav_dashboard: 'Panel',
            nav_login: 'Iniciar sesión',
            nav_logout: 'Cerrar sesión',
            nav_cart: 'Carrito',
            hero_title: 'Colección Verano 2026',
            hero_subtitle: 'Descubre productos premium con hasta 50% de descuento. ¡Oferta limitada!',
            hero_cta: 'Comprar ahora',
            products_title: 'Nuestros Productos',
            filter_all: 'Todos',
            filter_electronics: 'Electrónica',
            filter_fashion: 'Moda',
            filter_home: 'Hogar',
            add_to_cart: 'Añadir al carrito',
            added: '¡Añadido!',
            adding: 'Añadiendo...',
            toast_adding: 'añadiendo al carrito...',
            search_placeholder: 'Buscar productos...',
            stock_warning: 'Solo quedan {count} en stock',
            cart_title: 'Carrito',
            cart_empty: 'Tu carrito está vacío',
            cart_continue: 'Seguir comprando',
            cart_total: 'Total:',
            cart_checkout: 'Finalizar compra',
            checkout_title: 'Completar pedido',
            select_address: 'Seleccionar dirección de envío',
            new_address: 'Nueva dirección',
            save_address: 'Guardar',
            cancel: 'Cancelar',
            pay_now: 'Pagar ahora',
            login_title: 'Bienvenido',
            login_subtitle: 'Inicia sesión para continuar',
            login_button: 'Iniciar sesión',
            register_title: 'Crear cuenta',
            register_button: 'Crear cuenta',
            dash_overview: 'Resumen',
            dash_orders: 'Mis pedidos',
            dash_addresses: 'Direcciones',
            dash_profile: 'Editar perfil',
            dash_stats_orders: 'Pedidos',
            dash_stats_spent: 'Gasto total',
            dash_stats_addresses: 'Direcciones',
            dash_stats_cart: 'Artículos',
            status_pending: 'Pendiente',
            status_processing: 'Procesando',
            status_shipped: 'Enviado',
            status_delivered: 'Entregado',
            status_cancelled: 'Cancelado',
            toast_added: '¡añadido al carrito!',
            toast_error: 'Ha ocurrido un error',
            loading: 'Cargando...',
            sale: 'REBAJAS',
            new: 'NUEVO'
        },

        it: {
            nav_home: 'Home',
            nav_products: 'Prodotti',
            nav_dashboard: 'Dashboard',
            nav_login: 'Accedi',
            nav_logout: 'Esci',
            nav_cart: 'Carrello',
            hero_title: 'Collezione Estate 2026',
            hero_subtitle: 'Scopri prodotti premium con sconti fino al 50%. Offerta limitata!',
            hero_cta: 'Acquista ora',
            products_title: 'I Nostri Prodotti',
            filter_all: 'Tutti',
            filter_electronics: 'Elettronica',
            filter_fashion: 'Moda',
            filter_home: 'Casa',
            add_to_cart: 'Aggiungi al carrello',
            added: 'Aggiunto!',
            adding: 'Aggiungendo...',
            toast_adding: 'aggiunta al carrello in corso...',
            search_placeholder: 'Cerca prodotti...',
            stock_warning: 'Solo {count} rimasti in magazzino',
            cart_title: 'Carrello',
            cart_empty: 'Il tuo carrello è vuoto',
            cart_continue: 'Continua gli acquisti',
            cart_total: 'Totale:',
            cart_checkout: 'Procedi al pagamento',
            checkout_title: "Completa l'ordine",
            select_address: 'Seleziona indirizzo di consegna',
            new_address: 'Nuovo indirizzo',
            save_address: 'Salva',
            cancel: 'Annulla',
            pay_now: 'Paga ora',
            login_title: 'Bentornato',
            login_subtitle: 'Accedi per continuare',
            login_button: 'Accedi',
            register_title: 'Crea account',
            register_button: 'Crea account',
            dash_overview: 'Panoramica',
            dash_orders: 'I miei ordini',
            dash_addresses: 'Indirizzi',
            dash_profile: 'Modifica profilo',
            dash_stats_orders: 'Ordini',
            dash_stats_spent: 'Spesa totale',
            dash_stats_addresses: 'Indirizzi',
            dash_stats_cart: 'Articoli',
            status_pending: 'In attesa',
            status_processing: 'In elaborazione',
            status_shipped: 'Spedito',
            status_delivered: 'Consegnato',
            status_cancelled: 'Annullato',
            toast_added: 'aggiunto al carrello!',
            toast_error: 'Si è verificato un errore',
            loading: 'Caricamento...',
            sale: 'SALDI',
            new: 'NUOVO'
        }
    },

    // Get translation
    t(key, replacements = {}) {
        const lang = this.currentLang;
        let text = this.translations[lang]?.[key] || this.translations.en[key] || key;

        // Replace placeholders like {count}
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });

        return text;
    },

    // Set language
    setLang(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('lang', lang);
            document.documentElement.lang = lang;
            return true;
        }
        return false;
    },

    // Get current language info
    getCurrentLang() {
        return {
            code: this.currentLang,
            ...this.languages[this.currentLang]
        };
    },

    // Get all available languages
    getLanguages() {
        return Object.keys(this.languages).map(code => ({
            code,
            ...this.languages[code]
        }));
    },

    // Initialize
    init() {
        const saved = localStorage.getItem('lang');
        if (saved && this.translations[saved]) {
            this.currentLang = saved;
        }
        document.documentElement.lang = this.currentLang;
    }
};

// Auto-init
I18N.init();

// Make globally available
window.I18N = I18N;
window.t = (key, replacements) => I18N.t(key, replacements);
