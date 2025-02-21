package helpers

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"time"

	"math/rand"
)

func HashUsername(username string) string {
	hash := sha256.New()
	hash.Write([]byte(username))
	return hex.EncodeToString(hash.Sum(nil))
}

func Base64Encode(data string) string {
	return base64.StdEncoding.EncodeToString([]byte(data))
}

func Base64Decode(data string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return "", err
	}
	return string(decoded), nil
}

func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func ReverseString(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func IsPalindrome(s string) bool {
	reversed := ReverseString(s)
	return s == reversed
}

func RemoveDuplicates(s string) string {
	seen := make(map[rune]bool)
	result := []rune{}
	for _, char := range s {
		if !seen[char] {
			seen[char] = true
			result = append(result, char)
		}
	}
	return string(result)
}
