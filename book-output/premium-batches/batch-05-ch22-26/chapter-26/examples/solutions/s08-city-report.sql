SELECT c.city, COUNT(*) AS customers, SUM(a.balance) AS points
FROM customers c
JOIN accounts a ON a.customer_id = c.id
GROUP BY c.city
ORDER BY points DESC;
