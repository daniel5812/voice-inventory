export const parseVoiceCommand = (text: string) => {
    return {
      type: text.includes("הוספה") ? "add" : "remove",
      quantity: parseInt(text.replace(/\D/g, "")) || 1,
      itemName: "unknown",
    };
  };
  
  //delete ?