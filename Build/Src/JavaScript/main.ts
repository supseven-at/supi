import { Supi } from './Supi';

const initFunc = () => {
    (window as any).supi = new Supi();
    window.removeEventListener('load', initFunc);
};

window.addEventListener('load', initFunc);
