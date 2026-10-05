/* Local fallback used when the Netlify menu endpoint is unavailable. */
window.DISH101_MENU = [
 {id:'jollof',category:'mains',name:'Smoky Jollof Rice',description:'Party-style jollof with grilled chicken.',price:4500,badge:'Popular',image:'img/jollof-rice-rotated.jpg'},
 {id:'fried-rice',category:'mains',name:'Fried Rice & Chicken',description:'Colourful fried rice with juicy chicken.',price:4800,badge:'Best Seller',image:'img/ET5B7665-7.jpg'},
 {id:'shawarma',category:'mains',name:'Chicken Shawarma',description:'Wrapped chicken, crunchy veg and sauce.',price:3500,badge:'New',image:'img/Lebanese-Shawarma.png'},
 {id:'suya',category:'mains',name:'Chicken Suya',description:'Chargrilled, spicy and full of flavour.',price:4000,badge:'Spicy',image:'img/Chicken-Suya-IG-1.jpg'},
 {id:'spaghetti',category:'mains',name:'Jollof Spaghetti',description:'Saucy spaghetti with a Nigerian twist.',price:3500,badge:'Popular',image:'img/spaghetti-13.jpg'},
 {id:'egusi',category:'mains',name:'Egusi & Pounded Yam',description:'Rich egusi soup with soft pounded yam.',price:5000,badge:'Classic',image:'img/pounded-yam.jpg'},
 {id:'fries',category:'sides',name:'Crispy Fries',description:'Golden seasoned potato fries.',price:1800,badge:'Popular',image:'img/50223-homemade-crispy-seasoned-french-fries-VAT-Beauty-4x3-789ecb2eaed34d6e879b9a93dd56a50a.jpg'},
 {id:'wings',category:'sides',name:'Sticky Chicken Wings',description:'Tender wings glazed in our house sauce.',price:3200,badge:'Best Seller',image:'img/wholesomeyum-Baked-Whole-Chicken-Wings-15.jpg'},
 {id:'spring-rolls',category:'sides',name:'Spring Rolls',description:'Crisp rolls with savoury filling.',price:2200,badge:'New',image:'img/Easy-Samosa-with-Spring-Rolls-Sheets-Progress-Picures3.jpg'},
 {id:'plantain',category:'sides',name:'Fried Plantain',description:'Sweet caramelised plantain slices.',price:1300,badge:'Classic',image:'img/fried-plantains-6.jpg'},
 {id:'salad',category:'sides',name:'Fresh Garden Salad',description:'Crisp vegetables and house dressing.',price:2000,badge:'Fresh',image:'img/Summer-Salad_LowRes-005.jpg'},
 {id:'cola',category:'drinks',name:'Chilled Cola',description:'Ice-cold fizzy refreshment.',price:800,badge:'Cold',image:'img/fanta-pet_500x.png'},
 {id:'juice',category:'drinks',name:'Orange Juice',description:'Bright, refreshing fruit juice.',price:1500,badge:'Fresh',image:'img/Orange-juice-smoothie-featured-500x500.jpg'},
 {id:'zobo',category:'drinks',name:'Zobo Chapman',description:'Our chilled Nigerian house drink.',price:1200,badge:'Popular',image:'img/zobochapmanB.jpg'},
 {id:'coffee',category:'drinks',name:'Coffee',description:'A smooth cup to slow down with.',price:1500,badge:'Hot',image:'img/coffee-vs-tea-GettyImages-1327091626-5b144a37d98b4de7b5421d9b724f7e12.jpg'},
 {id:'cake',category:'desserts',name:'Celebration Cake',description:'A sweet slice for the finish.',price:2500,badge:'Sweet',image:'img/cake.jpg'},
 {id:'ice-cream',category:'desserts',name:'Ice Cream Sundae',description:'Vanilla ice cream with chocolate.',price:2200,badge:'Popular',image:'img/Ice_cream_with_whipped_cream,_chocolate_syrup,_and_a_wafer_(cropped).jpg'},
 {id:'puff-puff',category:'desserts',name:'Puff Puff',description:'Warm, fluffy, sweet bites.',price:1200,badge:'Classic',image:'img/Pumpkin-Drop-Donuts-puff-puff-03.jpg'}
].map(item=>({...item,price:item.price*100})); // The API and checkout use kobo.
