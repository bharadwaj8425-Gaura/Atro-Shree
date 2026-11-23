/* Common Indian cities (lat, lon). Any other place worldwide is searched online (Open-Meteo geocoding). */
window.AS_CITIES = [
  ['New Delhi', 28.6139, 77.2090], ['Delhi', 28.7041, 77.1025], ['Mumbai', 19.0760, 72.8777], ['Kolkata', 22.5726, 88.3639], ['Chennai', 13.0827, 80.2707],
  ['Bengaluru', 12.9716, 77.5946], ['Hyderabad', 17.3850, 78.4867], ['Ahmedabad', 23.0225, 72.5714], ['Pune', 18.5204, 73.8567], ['Jaipur', 26.9124, 75.7873],
  ['Lucknow', 26.8467, 80.9462], ['Kanpur', 26.4499, 80.3319], ['Nagpur', 21.1458, 79.0882], ['Indore', 22.7196, 75.8577], ['Bhopal', 23.2599, 77.4126],
  ['Patna', 25.5941, 85.1376], ['Vadodara', 22.3072, 73.1812], ['Surat', 21.1702, 72.8311], ['Rajkot', 22.3039, 70.8022], ['Ludhiana', 30.9010, 75.8573],
  ['Amritsar', 31.6340, 74.8723], ['Chandigarh', 30.7333, 76.7794], ['Jalandhar', 31.3260, 75.5762], ['Agra', 27.1767, 78.0081], ['Mathura', 27.4924, 77.6737],
  ['Vrindavan', 27.5650, 77.6593], ['Aligarh', 27.8974, 78.0880], ['Meerut', 28.9845, 77.7064], ['Ghaziabad', 28.6692, 77.4538], ['Noida', 28.5355, 77.3910],
  ['Gurugram', 28.4595, 77.0266], ['Faridabad', 28.4089, 77.3178], ['Varanasi', 25.3176, 82.9739], ['Prayagraj', 25.4358, 81.8463], ['Ayodhya', 26.7922, 82.1998],
  ['Gorakhpur', 26.7606, 83.3732], ['Bareilly', 28.3670, 79.4304], ['Moradabad', 28.8386, 78.7733], ['Dehradun', 30.3165, 78.0322], ['Haridwar', 29.9457, 78.1642],
  ['Rishikesh', 30.0869, 78.2676], ['Shimla', 31.1048, 77.1734], ['Jammu', 32.7266, 74.8570], ['Srinagar', 34.0837, 74.7973], ['Udaipur', 24.5854, 73.7125],
  ['Jodhpur', 26.2389, 73.0243], ['Ajmer', 26.4499, 74.6399], ['Kota', 25.2138, 75.8648], ['Bikaner', 28.0229, 73.3119], ['Gwalior', 26.2183, 78.1828],
  ['Jabalpur', 23.1815, 79.9864], ['Ujjain', 23.1765, 75.7885], ['Raipur', 21.2514, 81.6296], ['Ranchi', 23.3441, 85.3096], ['Jamshedpur', 22.8046, 86.2029],
  ['Dhanbad', 23.7957, 86.4304], ['Bhubaneswar', 20.2961, 85.8245], ['Cuttack', 20.4625, 85.8830], ['Puri', 19.8135, 85.8312], ['Guwahati', 26.1445, 91.7362],
  ['Siliguri', 26.7271, 88.3953], ['Gaya', 24.7914, 85.0002], ['Muzaffarpur', 26.1209, 85.3647], ['Nashik', 19.9975, 73.7898], ['Aurangabad', 19.8762, 75.3433],
  ['Thane', 19.2183, 72.9781], ['Navi Mumbai', 19.0330, 73.0297], ['Kolhapur', 16.7050, 74.2433], ['Goa (Panaji)', 15.4909, 73.8278], ['Mangaluru', 12.9141, 74.8560],
  ['Mysuru', 12.2958, 76.6394], ['Hubballi', 15.3647, 75.1240], ['Coimbatore', 11.0168, 76.9558], ['Madurai', 9.9252, 78.1198], ['Tiruchirappalli', 10.7905, 78.7047],
  ['Kochi', 9.9312, 76.2673], ['Thiruvananthapuram', 8.5241, 76.9366], ['Kozhikode', 11.2588, 75.7804], ['Visakhapatnam', 17.6868, 83.2185], ['Vijayawada', 16.5062, 80.6480],
  ['Tirupati', 13.6288, 79.4192], ['Warangal', 17.9689, 79.5941], ['Jhansi', 25.4484, 78.5685], ['Rohtak', 28.8955, 76.6066], ['Panipat', 29.3909, 76.9635],
  ['Karnal', 29.6857, 76.9905], ['Hisar', 29.1492, 75.7217], ['Bathinda', 30.2110, 74.9455], ['Patiala', 30.3398, 76.3869], ['Kathmandu (Nepal)', 27.7172, 85.3240]
].map(([name, lat, lon]) => ({ name, lat, lon, tz: name.includes('Nepal') ? 'Asia/Kathmandu' : 'Asia/Kolkata', country: name.includes('Nepal') ? 'Nepal' : 'India' }));
