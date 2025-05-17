import db from '../Config/database.js';

export const createMessage = (contactMessage, callback) => {
    const { email , phone , company_name , message , name , address , created_at  } = contactMessage; 
    
    const sql = "INSERT INTO contact_messages  (email , phone , company_name , message , name , address , created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [email , phone , company_name , message , name , address , created_at], callback); 
};