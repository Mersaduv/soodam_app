export const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fa`
      );
      const data = await response.json();
      
      let city = data.address.city || data.address.town || data.address.village || "نامشخص";
  
      return city.startsWith("شهر ") ? city.replace("شهر ", "") : city;
    } catch (error) {
      console.error("خطا در دریافت نام شهر:", error);
      return "نامشخص";
    }
  };
  