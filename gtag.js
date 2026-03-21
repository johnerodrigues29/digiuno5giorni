/**
 * Script Otimizado para Google Analytics (gtag.js)
 * Implementação com carregamento tardio para melhorar PageSpeed
 * 
 * Substitua 'G-0N45L9SEFN' pelo seu ID do Google Analytics
 */

(function() {
    'use strict';
    
    // Configurações
    const GA_ID = 'G-NT7MN3R6HB'; // Substitua pelo seu ID
    const DELAY_TIME = 3000; // Delay em milissegundos
    const INTERACTION_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    let isLoaded = false;
    
    /**
     * Carrega o Google Analytics
     */
    function loadGoogleAnalytics() {
        // Evita carregar múltiplas vezes
        if (isLoaded || window.gtag) return;
        isLoaded = true;
        
        // Cria e carrega o script do gtag
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        script.onerror = function() {
            console.warn('Falha ao carregar Google Analytics');
        };
        
        document.head.appendChild(script);
        
        // Inicializa o gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', GA_ID, {
            // Configurações opcionais para melhorar performance
            send_page_view: true,
            transport_type: 'beacon', // Usa sendBeacon quando disponível
            custom_map: {
                'custom_parameter': 'dimension1'
            }
        });
        
        // Remove event listeners após carregar
        INTERACTION_EVENTS.forEach(function(event) {
            document.removeEventListener(event, loadGoogleAnalytics);
        });
        
        console.log('Google Analytics carregado com sucesso');
    }
    
    /**
     * Detecta se é um bot/crawler
     */
    function isBot() {
        const botPatterns = [
            /bot/i, /crawl/i, /spider/i, /search/i,
            /google/i, /bing/i, /yahoo/i, /facebook/i
        ];
        
        return botPatterns.some(pattern => 
            pattern.test(navigator.userAgent)
        );
    }
    
    /**
     * Detecta se é mobile
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Detecta conexão lenta
     */
    function isSlowConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType === 'slow-2g' || 
                   connection.effectiveType === '2g' ||
                   connection.saveData === true;
        }
        return false;
    }
    
    /**
     * Inicializa o carregamento baseado nas condições
     */
    function init() {
        // Não carrega para bots
        if (isBot()) {
            console.log('Bot detectado, Google Analytics não será carregado');
            return;
        }
        
        // Para conexões lentas, aumenta o delay
        const delay = isSlowConnection() ? DELAY_TIME * 2 : DELAY_TIME;
        
        // Carrega após interação do usuário
        INTERACTION_EVENTS.forEach(function(event) {
            document.addEventListener(event, loadGoogleAnalytics, {
                once: true,
                passive: true
            });
        });
        
        // Fallback com delay
        setTimeout(loadGoogleAnalytics, delay);
        
        // Para mobile, também carrega quando a página fica visível
        if (isMobile() && 'visibilityState' in document) {
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') {
                    setTimeout(loadGoogleAnalytics, 1000);
                }
            }, { once: true });
        }
    }
    
    // Inicia quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expõe função global para carregamento manual se necessário
    window.loadGA = loadGoogleAnalytics;
    
})();