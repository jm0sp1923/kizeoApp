function cleanText(text) {
    if (text) {
      return text
        .toString()
        .replace(/[\r\n]+/g, ' ')  
        .replace(/\s+/g, ' ')      
        .replace(/[^a-zA-Z0-9\s]/g, '') 
        .trim();                 
    }
    return text;
  };

export default cleanText;