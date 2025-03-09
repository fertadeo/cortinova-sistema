"use client"
import { useEffect } from 'react';

declare global {
  interface Window {
    driver: {
      js: {
        driver: () => any;
      };
    };
  }
}

const TourGuide = () => {
  console.log('TourGuide component rendered');

  useEffect(() => {
    console.log('TourGuide useEffect triggered');
    
    const loadDriver = async () => {
      console.log('loadDriver function started');
      
      if (typeof window === 'undefined') {
        console.log('Window is undefined, returning early');
        return;
      }
      
      console.log('Current pathname:', window.location.pathname);
      if (window.location.pathname !== '/home') {
        console.log('Not in /home route, returning early');
        return;
      }

      const hasSeenTour = localStorage.getItem('hasSeenAppTour');
      console.log('hasSeenTour value:', hasSeenTour);
      
      if (hasSeenTour) {
        console.log('Tour already seen, returning early');
        return;
      }

      console.log('Loading driver.js script');
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js';
        script.onload = () => {
          console.log('driver.js script loaded');
          resolve(undefined);
        };
        document.head.appendChild(script);

        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css';
        document.head.appendChild(style);
      });

      setTimeout(() => {
        console.log('Timeout triggered, window.driver:', window.driver);
        
        if (window.driver?.js?.driver) {
          console.log('Driver is available, creating tour');
          const driver = window.driver.js.driver;
          const driverObj = driver();
          
          driverObj.highlight({
            element: '.presupuestos-table',
            popover: {
              title: 'Gestión de Presupuestos',
              description: 'Aquí puedes visualizar tus presupuestos y pasarlos a pedidos confirmados.',
              side: "bottom",
              align: 'start',
              onDeselected: () => {
                console.log('Tour completed, saving to localStorage');
                localStorage.setItem('hasSeenAppTour', 'true');
              }
            }
          });
        } else {
          console.log('Driver is not available after timeout');
        }
      }, 2000);
    };

    loadDriver().catch(error => {
      console.error('Error in loadDriver:', error);
    });
  }, []);

  return null;
};

export default TourGuide; 