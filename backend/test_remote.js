async function run() {
  try {
    const res = await fetch('https://mvss-erp-backend.onrender.com/backlogs');
    console.log('status:', res.status);
    console.log('text:', await res.text());
  } catch (err) {
    console.error('Error fetching remote:', err);
  }
}
run();
