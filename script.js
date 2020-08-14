const ARRAY = [];
const SORTVIEW = document.querySelector('#sortView');

function beep(index) {
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
  displayArray();
}

async function merge(minIndex, middle, maxIndex) {
  const sortedItems = [];
  const leftArr = [];
  const rightArr = [];

  for (let i = minIndex; i < middle; i += 1) leftArr.push(ARRAY[i]);
  for (let i = middle; i < maxIndex; i += 1) rightArr.push(ARRAY[i]);

  while (leftArr.length > 0 && rightArr.length > 0) {
    if (leftArr[0] > rightArr[0]) {
      sortedItems.push(rightArr[0]);
      rightArr.shift();
    } else {
      sortedItems.push(leftArr[0]);
      leftArr.shift();
    }
  }

  while (leftArr.length > 0) {
    sortedItems.push(leftArr[0]);
    leftArr.shift();
  }

  while (rightArr.length > 0) {
    sortedItems.push(rightArr[0]);
    rightArr.shift();
  }

  for (let i = 0; i < sortedItems.length; i += 1) {
    ARRAY[minIndex + i] = sortedItems[i];
    beep(minIndex + i);

    await displayArray();

    highlightItem(minIndex + i, 'red');
    highlightItem(minIndex, 'blue');
    highlightItem(maxIndex - 1, 'blue');
  }
}

function timeoutDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function addEventListeners() {
  document.querySelector('#shuffle').addEventListener('click', shuffle);
  document.querySelector('#bubble').addEventListener('click', bubbleSort);
  document.querySelector('#merge').addEventListener('click', mergeSort);
  document.querySelector('#insertion').addEventListener('click', insertionSort);
}

function init() {
  initArray(100);
  addEventListeners();
}

window.addEventListener('load', init);
