const haversine = require("haversine-distance");

// Hassan as the depot
const DEPOT = { lat: 13.0072, lon: 76.0962 };

/**
 * Cluster orders into batches based on proximity and balance total route time.
 * Each batch is then ordered by an optimized delivery route (nearest neighbor TSP).
 * @param {Array} orders - Array of order objects
 * @param {number} numDrivers - Number of available drivers (batches)
 * @returns {Array} Array of batches, each batch is an array of orders with delivery_rank
 */
function clusterOrders(orders, numDrivers) {
	if (orders.length === 0 || numDrivers === 0) return [];
	// Sort orders by ETA (integer UNIX timestamp)
	orders.sort((a, b) => a.eta - b.eta);
	// Initialize empty batches
	const batches = Array.from({ length: numDrivers }, () => []);
	// Greedy assignment: assign each order to the batch with the least total route distance
	for (const order of orders) {
		let bestBatchIdx = 0;
		let minScore = Infinity;
		for (let i = 0; i < batches.length; i++) {
			const batch = batches[i];
			// Route: depot -> ...batch orders... -> this order
			let route = [
				DEPOT,
				...batch.map((o) => ({ lat: o.latitude, lon: o.longitude })),
				{ lat: order.latitude, lon: order.longitude },
			];
			let routeDistance = 0;
			for (let j = 0; j < route.length - 1; j++) {
				routeDistance += haversine(route[j], route[j + 1]);
			}
			if (routeDistance < minScore) {
				minScore = routeDistance;
				bestBatchIdx = i;
			}
		}
		batches[bestBatchIdx].push(order);
	}
	// For each batch, solve TSP (nearest neighbor) to get delivery order
	for (const batch of batches) {
		if (batch.length === 0) continue;
		const visited = new Array(batch.length).fill(false);
		let route = [];
		let current = DEPOT;
		for (let r = 0; r < batch.length; r++) {
			let minDist = Infinity;
			let nextIdx = -1;
			for (let i = 0; i < batch.length; i++) {
				if (visited[i]) continue;
				const dist = haversine(current, {
					lat: batch[i].latitude,
					lon: batch[i].longitude,
				});
				if (dist < minDist) {
					minDist = dist;
					nextIdx = i;
				}
			}
			visited[nextIdx] = true;
			route.push(batch[nextIdx]);
			current = { lat: batch[nextIdx].latitude, lon: batch[nextIdx].longitude };
		}
		// Assign delivery_rank
		for (let i = 0; i < route.length; i++) {
			route[i].delivery_rank = i + 1;
		}
		// Replace batch with ordered route
		for (let i = 0; i < batch.length; i++) {
			batch[i] = route[i];
		}
	}
	return batches;
}

module.exports = { clusterOrders };
