
const SciFi = artifacts.require('SciFi');

function getTransactionCount(address) {
  return new Promise((resolve) => {
    web3.eth.getTransactionCount(address, (err, result) => {
      if (err) { reject (err); }
      else { resolve(result); }
    });
  });
}

function logTransactionCount(address) {
  return getTransactionCount(address)
    .then(count => {
      console.log('transactionCount', count);
    });
}

contract('SciFi', (accounts) => {
  it('should not add the vote to the bid if the value is 0', async () => {
    const movieName = web3.toHex('another_movie');
    const value = web3.toWei(0, 'ether');
    const sciFi = await SciFi.deployed();
    const initialReviewValue = parseFloat(await sciFi.bids.call(movieName));
    await sciFi.vote(
      movieName,
      {
        from: accounts[0],
        value: value,
      }
    );
    const movieReviewValue = parseFloat(await sciFi.bids.call(movieName));
    assert.equal(
      movieReviewValue - initialReviewValue,
      0,
      'Value should be 0'
    );
  });
  it('should add the vote to the bids if the movie doesn\'t exist', async () => {
    const movieName = web3.toHex('a_movie');
    const value = web3.toWei(0.002, 'ether');
    const sciFi = await SciFi.deployed();
    const initialReviewValue = parseFloat(await sciFi.bids.call(movieName));
    await sciFi.vote(
      movieName,
      {
        from: accounts[0],
        value: value,
      }
    );
    const updatedReviewValue = parseFloat(await sciFi.bids.call(movieName));
    assert.equal(
      updatedReviewValue - initialReviewValue,
      value,
      'Updated value does not increase of transaction value',
    );
  });
  it('should have review value 0 if the movie was never voted', async () => {
    const sciFi = await SciFi.deployed();
    const movieName = 'not_existing_movie';
    const notExistingMovieValue = parseFloat(await sciFi.bids.call(movieName));
    const numberOfBiddedMovies = parseInt(await sciFi.movie_num.call());
    assert.equal(
      notExistingMovieValue,
      0,
      'Never voted menu doesn\'t have 0 as value',
    );
    assert.equal(
      numberOfBiddedMovies,
      1,
      'The num_value should not include the movie number',
    );
  });
});