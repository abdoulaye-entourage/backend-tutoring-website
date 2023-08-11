const express = require('express');
const knex = require('knex')(require('../knexfile')['development']);
// const multerUpload = require('../middleware/multer.config');

const app = express();
app.use(express.json());

exports.getOneProfile = async (req, res, next) => {
    const { id } = req.params;
    try {
      // Récupérer le profil de l'étudiant depuis la table student_profiles
      const profile = await knex('tutor_profiles').where('user_id', id).first();
  
      if (!profile) {
        return res.status(400).json({ error: 'Profil tuteur non trouvé' });
      }
  
      return res.json({ profile });
    } catch (error) {
      console.error('Error lors de la récupération du profil du tuteur:', error);
      res.status(500).json({ message: 'Error lors de la récupération du profil du tuteur.' });
    }
}

exports.createTutorProfile = async (req, res, next) => {
    const { id } = req.params;
    // console.log('id2:', id)
    const { skills, experience, hourly_rate, availability } = req.body;
//   console.log('req.body:' , req.body)
//   console.log(req.file)
    try {
      // Vérifier si l'utilisateur existe
      const user = await knex('users').where('id', id).first();
    //   console.log('utilisateur:',user)
      if (!user) {
        return res.status(400).json({ error: 'Utilisateur non trouvé' });
      }
  
      // Vérifier si le profil de cet utilisateur existe déjà
      const existingProfile = await knex('tutor_profiles').where('user_id', id).first();
      if (existingProfile) {
        return res.status(400).json({ error: 'Le profil de cet utilisateur existe déjà dans la base de données' });
      }
  
      // Créer le profil tuteur dans la table tutor_profiles
      const imageUrl = req.file.filename;
    //   console.log('imsageUrl:', imageUrl)
    //   console.log('req.file:', req.file)
      await knex('tutor_profiles').insert({ user_id: id, imageUrl, skills, experience, hourly_rate, availability });
  
      return res.json({ message: 'Profil du tuteur créé avec succès' });
    } catch (error) {
        // console.log('Erreur:',error);
      return res.status(500).json({ error: 'Une erreur est survenue lors de la création du profil du tuteur' });
    }
  };
  

  exports.updateTutorProfile = async (req, res, next) => {
    // Récupérer l'ID de l'utilisateur depuis le token
    const userId = req.user.id;
  
    // Récupérer les données du formulaire de mise à jour du profil
    const { skills, experience, hourly_rate, availability } = req.body;
  
    try {
      // Vérifier si le profil de l'utilisateur existe
      const existingProfile = await knex('tutor_profiles').where('user_id', userId).first();
      if (!existingProfile) {
        return res.status(404).json({ error: "Le profil de l'utilisateur n'existe pas" });
      }
  
      // Mettre à jour les informations du profil
      await knex('tutor_profiles')
        .where('user_id', userId)
        .update({ skills, experience, hourly_rate, availability });
  
      return res.json({ message: 'Profil du tuteur mis à jour avec succès' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du profil du tuteur' });
    }
  };
  

 exports.getTutorSessions = async (req, res,next)=> {
    try {
        const tutorId = req.user.id;
        console.log('tutorId:',tutorId) 

        // Recuperer les sessions de tutotat réservées par le tuteur
        const tutorSessions = await knex('tutoring_sessions')
  .where('tutor_id', tutorId)
  .select('tutoring_sessions.id', 'subjects.name', 'tutoring_sessions.date', 'tutoring_sessions.start_time', 'tutoring_sessions.end_time', 'tutoring_sessions.location', 'tutoring_sessions.price')
  .leftJoin('subjects', 'tutoring_sessions.subject_id', 'subjects.id'); // Joindre table des matières  pour obtenir le nom. 


      console.log(tutorSessions);
      return res.json({sessions : tutorSessions})

    }catch (error) {
        console.log('Erreur:',error);
        return res.status(500).json({error: 'Erreur lors de la recuperation des sessions de tutora.'});
    }
 }


 exports.deleteSession  = async (req, res, next) => {
    const {id} = req.params; 

    try {
        // Verifier si la session existe dans la base de donnée
        const session = await knex('tutoring_sessions').where('id', id).first(); 
        if(!session) {
            return res.status(400).json({error: 'Session de mentorat non existante'})
        }
        // supprimer la session de mentorat
        await knex('tutoring_sessions').where('id', id).del()
    }catch (error) {
        return res.status(500).json({error: 'Erreur lors de la suppresion de la session de mentorat'})
    }

 }

 exports.updateSession = async (req, res) =>{
    const {id} = req.params; 
    const  {date, startTime, endTime, location, price} = req.body; 

    try {
        // verifier si la session de mentorat eiste dans la base de donnée
        const session = await  knex('tutoring_sessions').where('id', id).first(); 
        if(!session) {
            return res.status(400).json({error: 'Session de tutorat non trouvé'}); 
        }
        // verifier si  l'utilisateur est un tuteur ou l'etudiant qui a reservé la session
        if(session.tutor_id !== req.user.id && session.student_id !== req.user.id) {
            return res.status(403).json({error: 'Vous n"êtes pas autorisé à modifier cette session de tutorat'});
        }
        // Mettre à jour le session 
        const updatedSession = {
            date :date,
            startTime : startTime, 
            endTime : endTime, 
            location: location, 
            price : price, 
        }

        await knex('tutoring_sessions').where('id', id).first(); 

        return res.json({message : 'Session de tutorat mise à jour avec succès', updatedSession});  
        }catch(error) {
        return res.status(500).json({error : 'Erreur lors de la mise à jour de la session'});
    }
 }

 exports.createTutoringSession = async (req, res, next) => {
    const { tutor_id, subject_id, date, start_time, end_time, location, price } = req.body;
    // console.log('req.body:', req.body);
    
    try {
        // Vérifier si le tuteur existe dans la base de données
        const tutor = await knex('users').where({ id: tutor_id, user_type: 'Tutor' }).first(); 
        if (!tutor) {
            return res.status(400).json({ error: 'Tuteur non existant' }); 
        }

        // Vérifier si la matière existe dans la base de données
        const subject = await knex('subjects').where({ id: subject_id }).first(); 
        if (!subject) {
            return res.status(400).json({ error: 'Matière non existante' }); 
        }

        // Créer la nouvelle session de tutorat dans la table tutoring_sessions
        const newSession = {
            tutor_id: tutor_id,  
            subject_id: subject_id, 
            date: date, 
            start_time: start_time, 
            end_time: end_time, 
            location: location, 
            price: price, 
        }
        console.log('newSession:', newSession);

        await knex('tutoring_sessions').insert(newSession); 
        return res.json({ message: 'Session de tutorat créée avec succès' }); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur lors de la création de la session de tutorat' });
    }
}

// Récupérer la liste des matières disponibles pour les tuteurs
exports.getAvailableSubjects = async (req, res, next) =>{
    try {
        const subjects = await knex('subjects').select('id', 'name', 'level', 'description');

        return res.json({subjects})
    }catch(error) {
        return res.status(500).json({error: 'Erreur lors de la recuperation des matières disponible '})

    }
}
