const { LoremIpsum } = require('lorem-ipsum');

const { createRandomAccount, createRandomName } = require('../../scripts/eosio-util')


const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function generate_title(n) {
  title = lorem.generateWords(n);
  title = title.split(' ').map(capitalize).join(' ');
  return title;
}

async function generate_description(n) {
  return lorem.generateSentences(n);
}

async function generate_long_text(n) {
  return lorem.generateParagraphs(n);
}

async function generate_cid() {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  let length = 44
  var result = ''
  var types = ["png", "jpg", "webp"];
  var characters = 'abuacdefgohijkulmenopoqrestuviwxiyza1234567890'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  result = 'Qm' + capitalize(result) + ':' + types[getRandomInt(0, types.length)];
  return result
}

async function generate_supporting_file(sender = '', receiver = '') {

  if (!sender ) sender = await createRandomAccount();
  if (!receiver) receiver = await createRandomAccount();
  
  return {
    filename: await generate_title(3),
    address: await generate_cid(),
    sender: sender,
    receiver: receiver,
  }
}

async function generate_name() {
  var first_name = ["James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Charles", "Charles", "Daniel", "Matthew", "Anthony", "Mac"];
  var last_name = ["smith", "johnson", "williams", "brown", "jones", "garcia", "miller", "Davis", "Rodriguez", "Taylor", "Darwin", "DeMarco", "Jackson", "Lee", "Lehmann"];
  var name = capitalize(first_name[getRandomInt(0, first_name.length)]) + ' ' + capitalize(last_name[getRandomInt(0, last_name.length)]);
  return name;
}

module.exports = {
  generate_title,
  generate_description,
  generate_long_text,
  generate_cid,
  generate_name,
  generate_supporting_file
}