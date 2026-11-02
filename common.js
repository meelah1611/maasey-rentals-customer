export const $=s=>document.querySelector(s);
export const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt=ms=>new Date(ms).toLocaleString([], {dateStyle:'medium',timeStyle:'short'});
export const money=n=>'MVR '+Math.round(n*100)/100;
export const UNIT={hourly:36e5,daily:864e5,monthly:2592e6};
