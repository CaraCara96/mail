document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_sent('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_achieve('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').onsubmit = function(){
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
  
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
  
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result)
      load_sent();
  
    })
    .catch(error => console.log('Error:', error));
  
    return false;
  }

 
 
   
  


});

function load_sent(mailbox){
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  console.log("load_sent function triggered!");
fetch('/emails/sent')
.then(response => response.json())
.then( emails => {
  const emailsView = document.querySelector('#emails-view');
  emailsView.innerHTML ='';

  emails.forEach(email => {
    const mail = document.createElement('div');
    mail.className = 'email';
    mail.innerHTML = `<strong> To: </strong> ${email.recipients} <br>
    <strong> Subject: </strong> ${email.subject} <br>
    <strong> Timestamp: </strong> ${email.timestamp} <br>
    <strong> Body: </strong><br> ${email.body}
    <br> <br> <hr>
    `;
    emailsView.appendChild(mail);
  })
})
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
if(mailbox === 'archive'){
  load_achieve();
}
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    const emailsView = document.querySelector('#emails-view');
    emailsView.innerHTML ='';
   
      emails.forEach(email => {
        if(email.archived === false){
        const box = document.createElement('div');
        box.className = 'email';
        box.innerHTML =`
        <div class="wrapper" >
        <div class="email-container">
        <div class="subject">
        <span>
        <strong> From: </strong> ${email.sender} </span><span>
        <strong> Subject: </strong> ${email.subject} </span></div>
        <div>
        <strong> Timestamp: </strong> ${email.timestamp} <br> </div></div>
        <div class="bn">
        <button class="btn btn-lg btn-primary" id="view">View</button>
        </div>
        </div>
        `;
  
        box.style.backgroundColor = email.read?'white':'gray';
  
       const viewBtn = box.querySelector('#view');
       viewBtn.addEventListener('click', function(event){
        view_email(email.id)
        
        event.stopPropagation();
       })
        emailsView.append(box)
      }
      });
    

  });

}
 function view_email(id){
  fetch(`emails/${id}`, {
    method:'PUT',
    body: JSON.stringify({
      read:true
    })
  })
  .then(()=> {
    return fetch(`emails/${id}`);
  })
  .then(response => response.json())
  .then(email => {
   
   
    const emailsView = document.querySelector('#emails-view');
    emailsView.innerHTML='';

    const vue = document.createElement('div');
    vue.className = 'email';
    vue.innerHTML = `
     
    <strong> From: </strong> ${email.sender} <br> 
    <strong> Subject: </strong> ${email.subject} <br> 
    <strong> Timestamp: </strong> ${email.timestamp} <br> 
    <strong> Body: </strong> ${email.body} <br> 
    <br>
    <button class="btn btn-lg btn-success" id="email_achieve">Archive</button>
    <button class="btn btn-lg btn-secondary" id="myreply">Reply</button>
    `;
   
    const e_reply = vue.querySelector('#myreply');
    
    e_reply.addEventListener('click', function(event){
      const reply_form = document.querySelector('#compose-form');
      console.log(reply_form);
      console.log('yes')
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value =  `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `Date: ${email.timestamp} \n Message: \n ${email.body} \n ------------------------------------- \n`;

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      event.stopPropagation();
    });


    const e_achieve = vue.querySelector('#email_achieve');
    e_achieve.addEventListener('click', function(event){
      const data = {id:email.id}
      ach_email(data)
      console.log(data)
      event.stopPropagation();
    });
    


    emailsView.append(vue)
  }).catch(error =>{
    console.error('view error', error);
  })
 }

 function ach_email(data) {
  fetch(`emails/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      archived: true
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to archive email');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || contentType.indexOf('application/json') === -1) {
        return null; // No JSON to parse
      }
      return response.json();
    })
    .then(result => {
      
      load_achieve('archive');
    })
    .catch(error => {
      console.error('Error archiving the email', error);
    });
}
function load_achieve(mailbox){
  fetch('emails/archive')
  .then(response => {
    if(!response.ok){
      throw new Error('Failed to fetch emails');
    }
    return response.json();
  })
  .then(emails => {
    const emailsView = document.querySelector('#emails-view')
    emailsView.innerHTML='';

    emails.forEach(email => {
      const ach = document.createElement('div');
      ach.className = 'email';
      ach.innerHTML = `
      <br>
      <strong> From: </strong> ${email.sender} <br>
      <strong> Subject: </strong> ${email.subject} <br>
      <strong> Timestamp: </strong> ${email.timestamp} <br> <br>
      <button class="btn btn-lg btn-outline-primary" id="unarchive"> Unarchive </button> <br>
      `;
      const unarch = ach.querySelector('#unarchive')
      unarch.addEventListener('click', function(event){
        unarchive(email.id);
        event.stopPropagation();
      })

      emailsView.append(ach)
    });

   
  }).catch(error =>{
    console.error('Error loading archived emails')
  })
}
function unarchive(id){
  fetch(`emails/${id}`, {
    method:'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      archived: false
    })
  })
  .then(response =>{
    if(!response.ok){
      throw new Error(`Failed, status: ${response.status}`)
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || contentType.indexOf('application/json') === -1) {
      return null; // No JSON to parse
    }
    return response.json();
  })
  .then(result =>{
    
    load_mailbox('inbox');
  })
  .catch(error =>{
    console.error('Unarchived error', error);
  })
}