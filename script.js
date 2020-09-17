const ARRAY = [];
const SORTVIEW = document.querySelector('#sortView');

function beepFallback() {}

function audioContextBeep(index) {
  if (document.querySelector('#disableSound').style.display === 'none') return;
  const a = new AudioContext();
  const v = a.createOscillator();
  const u = a.createGain();
  v.connect(u);
  v.frequency.value = ARRAY[index] * 10;
  v.type = 'square';
  u.connect(a.destination);
  u.gain.value = 1;
  v.start(a.currentTime);
  v.stop(a.currentTime + 0.01);
}

const beep = (AudioContext) ? audioContextBeep : beepFallback;

function clearDisplay() {
  const c = SORTVIEW.getContext('2d');
  c.fillStyle = 'white';
  c.fillRect(0, 0, SORTVIEW.width, SORTVIEW.height);
}

async function displayArray() {
  await (timeoutDelay(2000 / ARRAY.length));
  clearDisplay();
  const c = SORTVIEW.getContext('2d');
  c.fillStyle = 'black';
  const itemWidth = SORTVIEW.width / ARRAY.length;
  for (let i = 0; i < ARRAY.length; i += 1) {
    const itemHeight = SORTVIEW.height / ARRAY.length * ARRAY[i];
    const horizontalStartPoint = i * itemWidth;
    c.fillRect(horizontalStartPoint, SORTVIEW.height - itemHeight, itemWidth, itemHeight);
  }
}

function highlightItem(index, color) {
  const c = SORTVIEW.getContext('2d');
  const itemWidth = SORTVIEW.width / ARRAY.length; // make global??
  const itemHeight = SORTVIEW.height / ARRAY.length * ARRAY[index];
  const horizontalStartPoint = index * itemWidth;
  c.fillStyle = color;
  c.fillRect(horizontalStartPoint, SORTVIEW.height - itemHeight, itemWidth, itemHeight);
}

async function initArray(length) {
  while (ARRAY.length > 0) {
    ARRAY.shift();
  }
  for (let i = 0; i < length; i += 1) {
    ARRAY.push(i);
    await timeoutDelay(3000 / length);
    highlightItem(i, 'blue');
    beep(i);
    displayArray();
  }
}

async function shuffle() {
  // Fisher Yates' algorithm https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
  for (let i = ARRAY.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * i);
    const buffer = ARRAY[i];
    highlightItem(randomIndex, 'red');
    highlightItem(i, 'blue');
    beep(i);
    ARRAY[i] = ARRAY[randomIndex];
    ARRAY[randomIndex] = buffer;
    await displayArray();
  }
}


async function insertionSort() {
  let sorted;
  while (!sorted) {
    sorted = true;

    for (let i = 0; i < ARRAY.length; i++) {
      beep(i);
      const el = ARRAY[i];

      let j;
      for (j = i - 1; j >= 0 && ARRAY[j] > el; j--) {
        ARRAY[j + 1] = ARRAY[j];
        highlightItem(i, 'blue');
        highlightItem(j + 1, 'red');
        beep(j + 1);
        await displayArray();
      }
      ARRAY[j + 1] = el;
    }
  }
  await displayArray();
}

async function bubbleSort() {
  let sorted;
  let sortedItems = 0;
  while (!sorted) {
    sorted = true;
    sortedItems += 1;
    for (let i = 0; i < ARRAY.length - sortedItems; i += 1) {
      highlightItem(i, 'blue');
      beep(i);
      if (ARRAY[i] > ARRAY[i + 1]) {
        highlightItem(i + 1, 'red');
        sorted = false;
        const buffer = ARRAY[i];
        ARRAY[i] = ARRAY[i + 1];
        ARRAY[i + 1] = buffer;
      }
      await displayArray();
    }
  }
}

// default parameters used as merge sort is recursive and is passed nothing in the
// first instance https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
async function mergeSort(e, minIndex = 0, maxIndex = ARRAY.length) {
  if (maxIndex - minIndex <= 1) {
    return;
  }

  const middle = Math.floor(maxIndex - ((maxIndex - minIndex) / 2));

  await mergeSort(null, minIndex, middle);
  await mergeSort(null, middle, maxIndex);

  await merge(minIndex, middle, maxIndex);
  await displayArray();
}

async function merge(minIndex, middle, maxIndex) {
  const leftArr = []; // instead of using arrays just swap if minIndex + i > middle + i :o
  const rightArr = [];
  let itemsSorted = 0;

  for (let i = minIndex; i < middle; i += 1) leftArr.push(ARRAY[i]);
  for (let i = middle; i < maxIndex; i += 1) rightArr.push(ARRAY[i]);

  while (leftArr.length > 0 && rightArr.length > 0) {
    if (leftArr[0] > rightArr[0]) {
      ARRAY[minIndex + itemsSorted] = rightArr[0];
      itemsSorted += 1;
      rightArr.shift();
    } else {
      ARRAY[minIndex + itemsSorted] = leftArr[0];
      itemsSorted += 1;
      leftArr.shift();
    }
    highlightItem(minIndex, 'blue');
    highlightItem(middle, 'blue');
    highlightItem(maxIndex - 1, 'blue');
    highlightItem(minIndex + itemsSorted, 'red');
    beep(minIndex + itemsSorted);
    await displayArray();
  }

  while (leftArr.length > 0) {
    ARRAY[minIndex + itemsSorted] = leftArr[0];
    beep(minIndex + itemsSorted);
    itemsSorted += 1;
    highlightItem(minIndex, 'blue');
    highlightItem(middle, 'blue');
    highlightItem(maxIndex - 1, 'blue');
    highlightItem(minIndex + itemsSorted, 'red'); // TODO put items to highlight in array
    await displayArray();
    leftArr.shift();
  }

  while (rightArr.length > 0) {
    ARRAY[minIndex + itemsSorted] = rightArr[0];
    beep(minIndex + itemsSorted);
    itemsSorted += 1;
    highlightItem(minIndex, 'blue');
    highlightItem(middle, 'blue');
    highlightItem(maxIndex - 1, 'blue');
    highlightItem(minIndex + itemsSorted, 'red');
    await displayArray();
    rightArr.shift();
  }
  await displayArray();
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addEventListeners() {
  const clickEvents = ['click', 'touch'];

  const controller = document.querySelector('#controller');
  const shuffleBtn = document.querySelector('#shuffle');
  const bubbleBtn = document.querySelector('#bubble');
  const mergeBtn = document.querySelector('#merge');
  const insertionBtn = document.querySelector('#insertion');
  const enableSoundBtn = document.querySelector('#enableSound');
  const disableSoundBtn = document.querySelector('#disableSound');
  const initBtn = document.querySelector('#init');
  const body = document.querySelector('body');
  for (const e of clickEvents) {
    shuffleBtn.addEventListener(e, shuffle);
    bubbleBtn.addEventListener(e, bubbleSort);
    mergeBtn.addEventListener(e, mergeSort);
    insertionBtn.addEventListener(e, insertionSort);

    enableSoundBtn.addEventListener(e, () => {
      enableSoundBtn.style.display = 'none';
      disableSoundBtn.style.display = '';
    });

    disableSoundBtn.addEventListener(e, () => {
      enableSoundBtn.style.display = '';
      disableSoundBtn.style.display = 'none';
    });


    initBtn.addEventListener(e, () => initArray(50));
    body.addEventListener(e, () => {
      if (controller.style.display === '') {
        controller.style.display = 'none';
      } else if (controller.style.display === 'none') {
        controller.style.display = '';
      }
    });
  }
}

function init() {
  addEventListeners();
}

window.addEventListener('load', init);
